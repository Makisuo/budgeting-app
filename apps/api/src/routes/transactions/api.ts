import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform"
import { Schema } from "effect"
import { InternalError } from "~/errors"
import { Transaction, TransactionId, TransactionNotFound } from "~/models/transaction"

export class TransactionApi extends HttpApiGroup.make("Transactions").add(
	HttpApiEndpoint.post("update", "/transactions/:id")
		.annotate(OpenApi.Summary, "Update Transaction")
		.setPath(Schema.Struct({ id: TransactionId }))
		.addSuccess(Transaction.json)
		.setPayload(Transaction.jsonUpdate.pick("categoryId"))
		.addError(InternalError)
		.addError(TransactionNotFound),
) {}
