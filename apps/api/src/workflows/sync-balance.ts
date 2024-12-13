import { Data, DateTime, Effect, Option, Schema, flow } from "effect"
import { NotFound } from "~/errors"
import { AccountId } from "~/models/account"
import { AccountRepo } from "~/repositories/account-repo"
import { TransactionRepo } from "~/repositories/transaction-repo"
import { makeWorkflowEntrypoint } from "~/services/cloudflare/workflows"
import { GoCardlessService } from "~/services/gocardless/gocardless-service"

const WorkflowParams = Schema.Struct({
	accountId: AccountId,
})

class WorkflowEventError extends Data.TaggedError("WorkflowEventError")<{ message?: string; cause?: unknown }> {}

const runMyWorkflow = ({ accountId }: typeof WorkflowParams.Type) =>
	Effect.gen(function* () {
		const accountRepo = yield* AccountRepo
		const transactionRepo = yield* TransactionRepo

		const goCardless = yield* GoCardlessService

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

		const transactions = yield* goCardless.getTransactions(account.id)

		yield* Effect.logInfo("Found booked transactions", transactions.transactions.booked.length)
		yield* Effect.logInfo("Found pending transactions", transactions.transactions.pending.length)

		const mappedBookedTransactions = yield* Effect.forEach(transactions.transactions.booked, (transaction) =>
			goCardless.transformTransaction(accountId, account.tenantId, transaction, "posted"),
		)

		const mappedPendingTransactions = yield* Effect.forEach(transactions.transactions.pending, (transaction) =>
			goCardless.transformTransaction(accountId, account.tenantId, transaction, "pending"),
		)

		yield* transactionRepo.insertMultipleVoid([...mappedBookedTransactions, ...mappedPendingTransactions])
	})

export const SyncBalanceWorkflow = makeWorkflowEntrypoint(
	{ name: "SyncBalanceWorkflow", binding: "SYNC_BALANCE_WORKFLOW", schema: WorkflowParams },
	flow(
		runMyWorkflow,
		Effect.provide([AccountRepo.Default, TransactionRepo.Default, GoCardlessService.Default]),
		Effect.mapError((error) => new WorkflowEventError({ cause: error })),
		Effect.orDie,
	),
)
