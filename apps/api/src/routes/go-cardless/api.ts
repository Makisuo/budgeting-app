import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"
import { InternalError } from "~/errors"
import { Institution } from "~/services/gocardless/models"

export class GoCardlessApi extends HttpApiGroup.make("gocardless").add(
	HttpApiEndpoint.get("getInstitutions", "/gocardless/institutions/:countryCode")
		.setPath(Schema.Struct({ countryCode: Schema.String }))
		.addSuccess(Schema.Array(Institution))
		.addError(InternalError),
) {}
