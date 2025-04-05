import { HttpApiMiddleware, HttpApiSecurity } from "@effect/platform"
import { Auth } from "@maple/api-utils/models"

import { Unauthorized } from "./errors"

export class Authorization extends HttpApiMiddleware.Tag<Authorization>()("Authorization", {
	failure: Unauthorized,
	provides: Auth.CurrentUser,
	security: {
		bearer: HttpApiSecurity.bearer,
	},
}) {}
