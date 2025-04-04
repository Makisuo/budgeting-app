import { TransactionId } from "@maple/api-utils/models"
import { Effect, Schema, flow, pipe } from "effect"
import { TransactionRepo } from "~/repositories/transaction-repo"
import { TransactionHelper } from "~/routes/transactions/transaction"
import { Workflow, makeWorkflowEntrypoint } from "~/services/cloudflare/workflows"

class StepGetDirectTransferTransactionsError extends Schema.TaggedError<StepGetDirectTransferTransactionsError>(
	"StepGetDirectTransferTransactionsError",
)("StepSyncBalanceError", {
	cause: Schema.Defect,
}) {}

class StepGetDirectTransferTransactionsRequest extends Schema.TaggedRequest<StepGetDirectTransferTransactionsRequest>()(
	"StepGetDirectTransferTransactionsRequest",
	{
		failure: StepGetDirectTransferTransactionsError,
		success: Schema.Array(
			Schema.Struct({
				outgoingTxId: TransactionId,
				incomingTxId: TransactionId,
				outgoingAmount: Schema.Number,
				incomingAmount: Schema.Number,
			}),
		),
		payload: {
			event: Schema.Void,
		},
	},
) {}

export const stepGetDirectTransferTransactions = Workflow.schema(StepGetDirectTransferTransactionsRequest, () =>
	Effect.gen(function* () {
		const transactionRepo = yield* TransactionRepo

		const transactions = yield* transactionRepo.getUndetectedDirectTransfers()

		return transactions
	}).pipe(Effect.tapError(Effect.logError), Effect.orDie),
)

class StepUpdateDirectTransferTransactionsError extends Schema.TaggedError<StepUpdateDirectTransferTransactionsError>(
	"StepUpdateDirectTransferTransactionsError",
)("StepSyncBalanceError", {
	cause: Schema.Defect,
}) {}

class StepUpdateDirectTransferTransactionsRequest extends Schema.TaggedRequest<StepUpdateDirectTransferTransactionsRequest>()(
	"StepUpdateDirectTransferTransactionsRequest",
	{
		failure: StepUpdateDirectTransferTransactionsError,
		success: Schema.Void,
		payload: {
			event: Schema.Struct({ transactionId: TransactionId, transferId: TransactionId }),
		},
	},
) {}

export const stepUpdateDirectTransferTransactions = Workflow.schema(
	StepUpdateDirectTransferTransactionsRequest,
	({ event }) =>
		Effect.gen(function* () {
			const transactionHelper = yield* TransactionHelper

			yield* transactionHelper.with(event.transactionId, (app) =>
				pipe(
					transactionHelper.update(app, {
						directTransfer: event.transferId,
					}),
					// policyUse(policy.canUpdate(app))
				),
			)

			return
		}).pipe(Effect.tapError(Effect.logError), Effect.orDie),
)

const runMyWorkflow = () =>
	Effect.gen(function* () {
		const directTransfers = yield* stepGetDirectTransferTransactions({ event: undefined })

		yield* Effect.forEach(directTransfers, (transfer) =>
			Effect.gen(function* () {
				yield* stepUpdateDirectTransferTransactions({
					event: { transactionId: transfer.outgoingTxId, transferId: transfer.incomingTxId },
				})

				yield* stepUpdateDirectTransferTransactions({
					event: { transactionId: transfer.incomingTxId, transferId: transfer.outgoingTxId },
				})
			}),
		)
	})

export const DetectDirectTransferTransactionsWorkflow = makeWorkflowEntrypoint(
	{
		name: "DetectDirectTransferTransactionsWorkflow",
		binding: "DETECT_DIRECT_TRANSACTIONS_WORKFLOW",
		schema: Schema.Void,
	},
	flow(runMyWorkflow, Effect.provide([TransactionRepo.Default, TransactionHelper.Default]), Effect.orDie),
)
