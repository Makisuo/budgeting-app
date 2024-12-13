import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"
import { Authorization } from "~/authorization"
import { InternalError } from "~/errors"
import { Institution } from "~/services/gocardless/models/models"

export class AdminApi extends HttpApiGroup.make("admin")
	.add(
		HttpApiEndpoint.post("syncInstitutions", "/admin/sync/institutions")
			.addSuccess(Schema.Array(Institution))
			.addError(InternalError),
	)
	.add(HttpApiEndpoint.post("syncAccounts", "/admin/sync/accounts").addError(InternalError)) {
	// .middlewareEndpoints(Authorization) {}
}
