import { HttpApiEndpoint, HttpApiGroup, HttpMiddleware, HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { Effect, Schema, pipe } from "effect"
import { InternalError, NotFound } from "~/errors"
import { CreateLinkResponse } from "./models"

export class GoCardlessApi extends HttpApiGroup.make("gocardless")
	.add(
		HttpApiEndpoint.post("createLink", "/gocardless/link")
			.setPayload(
				Schema.Struct({
					institutionId: Schema.String,
				}),
			)
			.addSuccess(CreateLinkResponse)
			.addError(InternalError),
	)
	.add(
		HttpApiEndpoint.get("callback", "/gocardless/callback/:id")
			.setPath(Schema.Struct({ id: Schema.String }))
			.addError(InternalError)
			.addError(NotFound),
	) {}
