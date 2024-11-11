import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"

export class BaseApi extends HttpApiGroup.make("helloWorld").add(
	HttpApiEndpoint.get("helloWorld", "/").addSuccess(Schema.String),
) {}
