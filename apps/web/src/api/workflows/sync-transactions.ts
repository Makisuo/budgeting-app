import { Duration, Effect, Option, Schema, flow } from "effect"
import { NotFound } from "~/worker/errors"

import { Account, Auth, Category, Transaction } from "@maple/api-utils/models"
import { AccountRepo } from "~/worker/repositories/account-repo"
import { TransactionRepo } from "~/worker/repositories/transaction-repo"
import { Workflow, makeWorkflowEntrypoint } from "~/worker/services/cloudflare/workflows"
import { GoCardlessService } from "~/worker/services/gocardless/gocardless-service"
import { TransactionHelpers } from "~/worker/services/transaction"
import { DatabaseLive } from "../db-live"

const WorkflowParams = Schema.Struct({
	accountId: Account.Id,
})

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
		event: Schema.Struct({ accountId: Account.Id }),
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
						balanceAmount: +(balance?.balanceAmount.amount || 0),
						balanceCurrency: balance?.balanceAmount.currency || "",
						id: accountId,
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
			event: Schema.Struct({ accountId: Account.Id, tenantId: Auth.TenantId }),
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
								categoryId: company?.categoryId || Category.Id.make("uncategorized"),
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

class StepCleanupPendingTransactionsError extends Schema.TaggedError<StepCleanupPendingTransactionsError>(
	"StepCleanupPendingTransactionsError",
)("StepCleanupPendingTransactionsError", {
	cause: Schema.Defect,
}) {}

class StepCleanupPendingTransactionsRequest extends Schema.TaggedRequest<StepCleanupPendingTransactionsRequest>()(
	"StepCleanupPendingTransactionsRequest",
	{
		failure: StepCleanupPendingTransactionsError,
		success: Schema.Void,
		payload: {
			event: Schema.Void,
		},
	},
) {}

export const stepCleanupPendingTransactions = Workflow.schema(
	StepCleanupPendingTransactionsRequest,
	() =>
		Effect.gen(function* () {
			const transaction = yield* TransactionRepo

			yield* transaction.deleteOldPendingTransactions()
		}).pipe(Effect.orDie),
	{
		retries: {
			limit: 3,
			delay: "300 millis",
		},
	},
)

const runMyWorkflow = ({ accountId }: typeof WorkflowParams.Type) =>
	Effect.gen(function* () {
		const accountRepo = yield* AccountRepo

		const account = yield* accountRepo.findById(accountId).pipe(
			Effect.flatMap(
				Option.match({
					onNone: () => new NotFound({ message: "Account not found" }),
					onSome: Effect.succeed,
				}),
			),
			Effect.andThen((previous) =>
				accountRepo.update({
					lastSync: new Date(),
					id: previous.id,
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
		Effect.provide(DatabaseLive),
		Effect.orDie,
	),
)
