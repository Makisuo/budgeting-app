import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"

export class BaseApi extends HttpApiGroup.make("api").add(
	HttpApiEndpoint.get("healthCheck", "/").addSuccess(Schema.String),
) {}
