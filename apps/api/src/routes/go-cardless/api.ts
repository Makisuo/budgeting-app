import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"
import { InternalError } from "~/errors"

export class GoCardlessApi extends HttpApiGroup.make("gocardless").add(
	HttpApiEndpoint.post("createLink", "/gocardless/link")
		.setPayload(
			Schema.Struct({
				institutionId: Schema.String,
			}),
		)
		.addSuccess(Schema.String)
		.addError(InternalError),
) {}
