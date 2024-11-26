import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"
import { InternalError } from "~/errors"
import { Institution } from "~/payment-engine/provider/go-cardless/models"

export class AdminApi extends HttpApiGroup.make("admin").add(
	HttpApiEndpoint.get("syncInstitutions", "/admin/sync/institutions")
		.addSuccess(Schema.Array(Institution))
		.addError(InternalError),
) {}
