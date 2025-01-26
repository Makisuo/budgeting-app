import { HttpApi, HttpServerRequest, OpenApi } from "@effect/platform"
import { Config, Effect, Layer } from "effect"
import { Authorization, TenantId, User } from "./authorization"
import { Unauthorized } from "./errors"
import { AdminApi } from "./routes/admin/api"
import { GoCardlessApi } from "./routes/go-cardless/api"
import { RootApi } from "./routes/root/api"

import { BetterAuthApi } from "./routes/better-auth/api"
import { SubscriptionApi } from "./routes/subscriptions/api"
import { TransactionApi } from "./routes/transactions/api"
import { BetterAuth } from "./services/better-auth"

export const AuthorizationLive = Layer.effect(
	Authorization,
	Effect.gen(function* () {
		const betterAuth = yield* BetterAuth

		return Authorization.of({
			bearer: (bearerToken) =>
				Effect.gen(function* () {
					const req = yield* HttpServerRequest.HttpServerRequest

					const raw = req.source as Request

					const session = yield* betterAuth
						.call((client) =>
							client.api.getSession({
								headers: new Headers(raw.headers),
							}),
						)
						.pipe(
							Effect.tapError((err) => Effect.logError(err)),
							Effect.catchTag(
								"BetterAuthApiError",
								(err) =>
									new Unauthorized({
										message: "User is not singed in",

										// action: "read",
										// actorId: TenantId.make("anonymous"),
										// entity: "Unknown",
									}),
							),
						)

					if (!session) {
						return yield* Effect.fail(
							new Unauthorized({
								message: "User is not singed in",
								// action: "read",
								// actorId: TenantId.make("anonymous"),
								// entity: "Unknown",
							}),
						)
					}

					const subId = session.session.userId

					return User.make({
						tenantId: TenantId.make(subId),
					})
				}),
		})
	}).pipe(Effect.provide(BetterAuth.Default)),
)

export class Api extends HttpApi.make("api")
	.add(RootApi)
	.add(GoCardlessApi)
	.add(AdminApi)
	.add(SubscriptionApi)
	.add(TransactionApi)
	.add(BetterAuthApi)
	.annotate(OpenApi.Title, "Hazel API") {}
