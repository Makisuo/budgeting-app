import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform"
import { Transaction, TransactionId, TransactionNotFound } from "@maple/api-utils/models"
import { Schema } from "effect"
import { InternalError } from "~/errors"

export class TransactionApi extends HttpApiGroup.make("Transactions").add(
	HttpApiEndpoint.post("update", "/transactions/:id")
		.annotate(OpenApi.Summary, "Update Transaction")
		.setPath(Schema.Struct({ id: TransactionId }))
		.addSuccess(Transaction.json)
		.setPayload(Transaction.jsonUpdate.pick("categoryId"))
		.addError(InternalError)
		.addError(TransactionNotFound),
) {}
