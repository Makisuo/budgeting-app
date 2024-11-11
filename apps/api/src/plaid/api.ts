import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "@effect/platform"
import { Schema } from "effect"

export class PlaidInternalError extends Schema.TaggedError<PlaidInternalError>()(
	"UserNotFound",
	{},
	HttpApiSchema.annotations({ status: 500 }),
) {}

export class PlaidApi extends HttpApiGroup.make("plaid").add(
	HttpApiEndpoint.get("exchangeToken", "/exchange-token")
		.addSuccess(Schema.String)
		.addError(PlaidInternalError)
		.setPayload(
			Schema.Struct({
				publicToken: Schema.String,
			}),
		),
) {}
