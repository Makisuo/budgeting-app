import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform"
import { Schema } from "effect"
import { InternalError } from "~/errors"

export class TransactionApi extends HttpApiGroup.make("Transactions").add(
	HttpApiEndpoint.get("update", "/transactions")
		.annotate(OpenApi.Summary, "Health Check")
		// .addSuccess(Transaction)
		.addSuccess(Schema.String)
		.setPayload(
			Schema.Struct({
				intialTransactionIds: Schema.Array(Schema.String),
			}),
		)
		.addError(InternalError),
) {}
