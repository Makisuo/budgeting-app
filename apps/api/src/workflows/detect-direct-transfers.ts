import { Effect, Schema } from "effect"
import { TransactionRepo } from "~/repositories/transaction-repo"
import { Workflow } from "~/services/cloudflare/workflows"

class StepGetDirectTransferTransactionsError extends Schema.TaggedError<StepGetDirectTransferTransactionsError>(
	"StepGetDirectTransferTransactionsError",
)("StepSyncBalanceError", {
	cause: Schema.Defect,
}) {}

class StepGetDirectTransferTransactionsRequest extends Schema.TaggedRequest<StepGetDirectTransferTransactionsRequest>()(
	"StepGetDirectTransferTransactionsRequest",
	{
		failure: StepGetDirectTransferTransactionsError,
		success: Schema.Void,
		payload: {
			event: Schema.Void,
		},
	},
) {}
