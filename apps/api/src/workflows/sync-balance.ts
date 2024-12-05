import { Data, DateTime, Effect, Option, Schema, flow } from "effect"
import { NotFound } from "~/errors"
import { AccountId } from "~/models/account"
import { AccountRepo } from "~/repositories/account-repo"
import { TranscationRepo } from "~/repositories/transaction-repo"
import { makeWorkflow } from "~/services/cloudflare/workflows"
import { GoCardlessService } from "~/services/gocardless/gocardless-service"
import { transformTransaction } from "~/services/gocardless/transformer"

const WorkflowParams = Schema.Struct({
	accountId: AccountId,
})

class WorkflowEventError extends Data.TaggedError("WorkflowEventError")<{ message?: string; cause?: unknown }> {}

const runMyWorkflow = ({ accountId }: typeof WorkflowParams.Type) =>
	Effect.gen(function* () {
		const accountRepo = yield* AccountRepo
		const transactionRepo = yield* TranscationRepo

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

		const mappedBookedTransactions = transactions.transactions.booked.map((v) =>
			transformTransaction(accountId, account.tenantId, v, "posted"),
		)
		const mappedPendingTransactions = transactions.transactions.pending.map((v) =>
			transformTransaction(accountId, account.tenantId, v, "pending"),
		)

		yield* transactionRepo.insertMultipleVoid([...mappedBookedTransactions, ...mappedPendingTransactions])
	})

export const SyncBalanceWorkflow = makeWorkflow(
	{ name: "SyncBalanceWorkflow", binding: "SYNC_BALANCE_WORKFLOW", schema: WorkflowParams },
	flow(
		runMyWorkflow,
		Effect.provide([AccountRepo.Default, TranscationRepo.Default, GoCardlessService.Default]),
		Effect.mapError((error) => new WorkflowEventError({ cause: error })),
		Effect.orDie,
	),
)
