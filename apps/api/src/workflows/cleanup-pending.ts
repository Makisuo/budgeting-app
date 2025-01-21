import { Effect, Schema } from "effect"
import { TransactionRepo } from "~/repositories/transaction-repo"
import { Workflow } from "~/services/cloudflare/workflows"

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
