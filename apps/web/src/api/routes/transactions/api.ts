import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform"
import { Transaction } from "@maple/api-utils/models"
import { Schema } from "effect"
import { InternalError } from "~/worker/errors"

export class TransactionApi extends HttpApiGroup.make("Transactions").add(
	HttpApiEndpoint.post("update", "/transactions/:id")
		.annotate(OpenApi.Summary, "Update Transaction")
		.setPath(Schema.Struct({ id: Transaction.Id }))
		.addSuccess(Transaction.Model.json)
		.setPayload(Transaction.Model.jsonUpdate.pick("categoryId"))
		.addError(InternalError)
		.addError(Transaction.TransactionNotFound),
) {}
