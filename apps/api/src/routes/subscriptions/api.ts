import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform"
import { Schema } from "effect"
import { InternalError } from "~/errors"
import { Subscription } from "~/models/subscription"

export class SubscriptionApi extends HttpApiGroup.make("Subscriptions").add(
	HttpApiEndpoint.get("create", "/")
		.annotate(OpenApi.Summary, "Health Check")
		// .addSuccess(Subscription)
		.addSuccess(Schema.String)
		.setPayload(
			Schema.Struct({
				intialTransactionIds: Schema.Array(Schema.String),
			}),
		)
		.addError(InternalError),
) {}
