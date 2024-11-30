import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"
import { InternalError, NotFound } from "~/errors"
import { InstitutionId } from "~/models/institution"
import { CreateLinkResponse } from "./models"

export class GoCardlessApi extends HttpApiGroup.make("gocardless")
	.add(
		HttpApiEndpoint.post("createLink", "/gocardless/link")
			.setPayload(
				Schema.Struct({
					institutionId: InstitutionId,
				}),
			)
			.addSuccess(CreateLinkResponse)
			.addError(InternalError)
			.addError(NotFound),
	)
	.add(
		HttpApiEndpoint.get("callback", "/gocardless/callback/:id")
			.setPath(Schema.Struct({ id: Schema.String }))
			.addError(InternalError)
			.addError(NotFound),
	)
	.add(
		HttpApiEndpoint.get("sync", "/gocardless/sync/:referenceId")
			.setPath(
				Schema.Struct({
					referenceId: Schema.String,
				}),
			)
			.addError(InternalError)
			.addError(NotFound)
			.addSuccess(Schema.String),
	) {}
