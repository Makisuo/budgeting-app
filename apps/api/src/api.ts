import { HttpApi, OpenApi } from "@effect/platform"
import { Effect, Layer, Redacted } from "effect"
import { Authorization, User } from "./authorization"
import { BaseApi } from "./routes/main/api"
import { PlaidApi } from "./routes/plaid/api"

export const AuthorizationLive = Layer.effect(
	Authorization,
	Effect.gen(function* () {
		yield* Effect.log("creating Authorization middleware")

		// return the security handlers
		return Authorization.of({
			bearer: (bearerToken) =>
				Effect.gen(function* () {
					// TODO: Authenticate later and get session here
					yield* Effect.log("checking bearer token", Redacted.value(bearerToken))

					return new User({ id: "placeholder" })
				}),
		})
	}),
)

export class Api extends HttpApi.empty.add(PlaidApi).add(BaseApi).annotate(OpenApi.Title, "Groups API") {}
