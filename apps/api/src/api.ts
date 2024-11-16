import { HttpApi, OpenApi } from "@effect/platform"
import { Effect, Layer, Redacted } from "effect"
import { Authorization, User } from "./authorization"
import { Unauthorized } from "./errors"
import { BaseApi } from "./routes/main/api"
import { PlaidApi } from "./routes/plaid/api"
import { BetterAuthService } from "./services/auth-service"

export const AuthorizationLive = Layer.effect(
	Authorization,
	Effect.gen(function* () {
		const betterAuth = yield* BetterAuthService

		yield* Effect.log("creating Authorization middleware")

		// return the security handlers
		return Authorization.of({
			bearer: (bearerToken) =>
				Effect.gen(function* () {
					const session = yield* betterAuth.call((client, signal) =>
						client.getSession({
							headers: new Headers({ Authorization: `Bearer ${Redacted.value(bearerToken)}` }),
							signal,
						}),
					)

					if (!session) {
						return yield* new Unauthorized()
					}

					yield* Effect.log("checking bearer token", Redacted.value(bearerToken))

					return new User({ id: session?.user.id })
				}).pipe(Effect.catchTags({ BetterAuthError: (error) => new Unauthorized(error) })),
		})
	}),
)

export class Api extends HttpApi.empty.add(PlaidApi).add(BaseApi).annotate(OpenApi.Title, "Groups API") {}
