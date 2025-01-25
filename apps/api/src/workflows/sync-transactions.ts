import { Data, DateTime, Duration, Effect, Option, Schema, flow, pipe } from "effect"
import { TenantId } from "~/authorization"
import { NotFound } from "~/errors"
import { AccountId } from "~/models/account"
import { CategoryId } from "~/models/categories"
import { Transaction } from "~/models/transaction"
import { AccountRepo } from "~/repositories/account-repo"
import { TransactionRepo } from "~/repositories/transaction-repo"
import { Workflow, makeWorkflowEntrypoint } from "~/services/cloudflare/workflows"
import { GoCardlessService } from "~/services/gocardless/gocardless-service"
import { TransactionHelpers } from "~/services/transaction"
import { stepCleanupPendingTransactions } from "./cleanup-pending"

const WorkflowParams = Schema.Struct({
	accountId: AccountId,
})

class WorkflowEventError extends Data.TaggedError("WorkflowEventError")<{ message?: string; cause?: unknown }> {}

class StepSyncBalanceError extends Schema.TaggedError<StepSyncBalanceError>("StepSyncBalanceError")(
	"StepSyncBalanceError",
	{
		cause: Schema.Defect,
	},
) {}

class StepSyncBalanceRequest extends Schema.TaggedRequest<StepSyncBalanceRequest>()("StepSyncBalanceRequest", {
	failure: StepSyncBalanceError,
	success: Schema.Void,
	payload: {
		event: Schema.Struct({ accountId: AccountId }),
	},
}) {}

const stepSyncBalance = Workflow.schema(
	StepSyncBalanceRequest,
	({ event: { accountId } }) =>
		Effect.gen(function* () {
			const accountRepo = yield* AccountRepo
			const goCardless = yield* GoCardlessService

			const { balances } = yield* goCardless.getBalances(accountId)

			const balance = balances[0]

			yield* accountRepo.findById(accountId).pipe(
				Effect.flatMap(
					Option.match({
						onNone: () => new NotFound({ message: "Account not found" }),
						onSome: Effect.succeed,
					}),
				),
				Effect.andThen((previous) =>
					accountRepo.updateVoid({
						...previous,
						balanceAmount: +(balance?.balanceAmount.amount || 0),
						balanceCurrency: balance?.balanceAmount.currency || "",
						updatedAt: undefined,
					}),
				),
			)

			return
		}).pipe(Effect.orDie),
	{
		retries: {
			limit: 0,
			delay: Duration.millis(1000),
		},
	},
)

class StepSyncTransactionsError extends Schema.TaggedError<StepSyncTransactionsError>("StepSyncTransactionsError")(
	"StepSyncTransactionsError",
	{
		cause: Schema.Defect,
	},
) {}

class StepSyncTransactionsRequest extends Schema.TaggedRequest<StepSyncTransactionsRequest>()(
	"StepSyncTransactionsRequest",
	{
		failure: StepSyncTransactionsError,
		success: Schema.Void,
		payload: {
			event: Schema.Struct({ accountId: AccountId, tenantId: TenantId }),
		},
	},
) {}

const stepSyncTransactions = Workflow.schema(
	StepSyncTransactionsRequest,
	({ event: { accountId, tenantId } }) =>
		Effect.gen(function* () {
			const transactionRepo = yield* TransactionRepo
			const goCardless = yield* GoCardlessService

			const transactionHelper = yield* TransactionHelpers

			const transactions = yield* goCardless.getTransactions(accountId)

			yield* Effect.logInfo("Found booked transactions", transactions.transactions.booked.length)
			yield* Effect.logInfo("Found pending transactions", transactions.transactions.pending.length)

			const mappedBookedTransactions = yield* Effect.forEach(transactions.transactions.booked, (transaction) =>
				goCardless.transformTransaction(accountId, tenantId, transaction, "posted"),
			)

			const mappedPendingTransactions = yield* Effect.forEach(transactions.transactions.pending, (transaction) =>
				goCardless.transformTransaction(accountId, tenantId, transaction, "pending"),
			)

			const mappedTransactions = yield* Effect.forEach(
				[...mappedBookedTransactions, ...mappedPendingTransactions],
				(transaction) =>
					Effect.gen(function* () {
						const company = yield* transactionHelper
							.detectCompany(transaction.name)
							.pipe(Effect.map(Option.getOrElse(() => null)))

						return yield* Effect.succeed(
							Transaction.insert.make({
								...transaction,
								companyId: company?.id || null,
								categoryId: company?.categoryId || CategoryId.make("uncategorized"),
							}),
						)
					}),
			)

			yield* transactionRepo.insertMultipleVoid(mappedTransactions)

			return
		}).pipe(Effect.tapError(Effect.logError), Effect.orDie),
	{
		retries: {
			limit: 0,
			delay: Duration.millis(1000),
		},
	},
)

const runMyWorkflow = ({ accountId }: typeof WorkflowParams.Type) =>
	Effect.gen(function* () {
		const accountRepo = yield* AccountRepo

		const now = yield* DateTime.now

		const account = yield* accountRepo.findById(accountId).pipe(
			Effect.flatMap(
				Option.match({
					onNone: () => new NotFound({ message: "Account not found" }),
					onSome: Effect.succeed,
				}),
			),
			Effect.andThen((previous) =>
				accountRepo.update({
					...previous,
					lastSync: now,
					updatedAt: undefined,
				}),
			),
		)

		yield* stepSyncBalance({ event: { accountId } })
		yield* stepSyncTransactions({ event: { accountId, tenantId: account.tenantId } })

		yield* stepCleanupPendingTransactions({ event: undefined })
	})

export const SyncTransactionsWorkflow = makeWorkflowEntrypoint(
	{ name: "SyncTransactionsWorkflow", binding: "SYNC_TRANSACTIONS_WORKFLOW", schema: WorkflowParams },
	flow(
		runMyWorkflow,
		Effect.provide([
			AccountRepo.Default,
			TransactionRepo.Default,
			GoCardlessService.Default,
			TransactionHelpers.Default,
		]),
		Effect.orDie,
	),
)
