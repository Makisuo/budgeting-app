import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"
import { InternalError } from "~/errors"
import { CreateLinkResponse } from "./models"

export class GoCardlessApi extends HttpApiGroup.make("gocardless").add(
	HttpApiEndpoint.post("createLink", "/gocardless/link")
		.setPayload(
			Schema.Struct({
				institutionId: Schema.String,
			}),
		)
		.addSuccess(CreateLinkResponse)
		.addError(InternalError),
) {}
