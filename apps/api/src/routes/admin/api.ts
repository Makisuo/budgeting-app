import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"
import { InternalError } from "~/errors"
import { Institution } from "~/services/gocardless/models"

export class AdminApi extends HttpApiGroup.make("admin").add(
	HttpApiEndpoint.post("syncInstitutions", "/admin/sync/institutions")
		.addSuccess(Schema.Array(Institution))
		.addError(InternalError),
) {}
