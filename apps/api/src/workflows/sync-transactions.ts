import { Data, DateTime, Duration, Effect, Option, Schema, flow } from "effect"
import { TenantId } from "~/authorization"
import { NotFound } from "~/errors"
import { AccountId } from "~/models/account"
import { AccountRepo } from "~/repositories/account-repo"
import { TranscationRepo } from "~/repositories/transaction-repo"
import { Workflow, makeWorkflow } from "~/services/cloudflare/workflows"
import { GoCardlessService } from "~/services/gocardless/gocardless-service"
import { transformTransaction } from "~/services/gocardless/transformer"

const WorkflowParams = Schema.Struct({
	accountId: AccountId,
})

class WorkflowEventError extends Data.TaggedError("WorkflowEventError")<{ message?: string; cause?: unknown }> {}

class StepSyncBalanceRequest extends Schema.TaggedRequest<StepSyncBalanceRequest>()("StepSyncBalanceRequest", {
	failure: Schema.Never,
	success: Schema.Void,
	payload: {
		event: Schema.Struct({ accountId: AccountId }),
	},
}) {}

const stepSyncBalance = Workflow.fn(
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

class StepSyncTransactionsRequest extends Schema.TaggedRequest<StepSyncTransactionsRequest>()(
	"StepSyncTransactionsRequest",
	{
		failure: Schema.Never,
		success: Schema.Void,
		payload: {
			event: Schema.Struct({ accountId: AccountId, tenantId: TenantId }),
		},
	},
) {}

const stepSyncTransactions = Workflow.fn(
	StepSyncTransactionsRequest,
	({ event: { accountId, tenantId } }) =>
		Effect.gen(function* () {
			const transactionRepo = yield* TranscationRepo
			const goCardless = yield* GoCardlessService

			const transactions = yield* goCardless.getTransactions(accountId)

			yield* Effect.logInfo("Found booked transactions", transactions.transactions.booked.length)
			yield* Effect.logInfo("Found pending transactions", transactions.transactions.pending.length)

			const mappedBookedTransactions = transactions.transactions.booked.map((v) =>
				transformTransaction(accountId, tenantId, v, "posted"),
			)
			const mappedPendingTransactions = transactions.transactions.pending.map((v) =>
				transformTransaction(accountId, tenantId, v, "pending"),
			)

			yield* transactionRepo.insertMultipleVoid([...mappedBookedTransactions, ...mappedPendingTransactions])

			return
		}).pipe(Effect.orDie),
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
	})

export const SyncTransactionsWorkflow = makeWorkflow(
	{ name: "SyncTransactionsWorkflow", binding: "SYNC_TRANSACTIONS_WORKFLOW", schema: WorkflowParams },
	flow(
		runMyWorkflow,
		Effect.provide([AccountRepo.Default, TranscationRepo.Default, GoCardlessService.Default]),
		Effect.mapError((error) => new WorkflowEventError({ cause: error })),
		Effect.orDie,
	),
)
