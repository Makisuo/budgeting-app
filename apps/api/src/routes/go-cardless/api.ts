import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Account, InstitutionId, Requisition } from "@maple/api-utils/models"
import { Schema } from "effect"
import { Authorization } from "~/authorization"
import { InternalError, NotFound } from "~/errors"
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
			.addError(NotFound)
			.middleware(Authorization),
	)
	.add(
		HttpApiEndpoint.get("callback", "/gocardless/callback/:id")
			.setPath(Schema.Struct({ id: Requisition.ReferenceId }))
			.addError(InternalError)
			.addError(NotFound),
	)
	.add(
		HttpApiEndpoint.post("sync", "/gocardless/sync/:accountId")
			.setPath(
				Schema.Struct({
					accountId: Account.Id,
				}),
			)
			.addError(InternalError)
			.addError(NotFound)
			.addSuccess(Schema.String)
			.middleware(Authorization),
	) {}
