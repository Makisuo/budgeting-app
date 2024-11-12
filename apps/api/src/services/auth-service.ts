import { betterAuth } from "better-auth"
import { bearer, passkey } from "better-auth/plugins"

import { HttpApiSchema } from "@effect/platform"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { getDb } from "db"
import { Config, Effect, Schema } from "effect"

export class BetterAuthError extends Schema.TaggedError<BetterAuthError>()(
	"BetterAuthError",
	{},
	HttpApiSchema.annotations({ status: 500 }),
) {}
export class BetterAuthService extends Effect.Service<BetterAuthService>()("BetterAuthService", {
	effect: Effect.gen(function* () {
		const connectionString = yield* Config.string("DATABASE_URL")

		const auth = betterAuth({
			database: drizzleAdapter(getDb(connectionString), {
				provider: "pg",
			}),
			emailAndPassword: {
				enabled: true,
			},

			account: {
				accountLinking: {
					enabled: true,
				},
			},

			plugins: [passkey(), bearer()],
		})

		const call = <A>(f: (client: typeof auth.api, signal: AbortSignal) => Promise<A>) =>
			Effect.tryPromise({
				try: (signal) => f(auth.api, signal),
				catch: (error) => {
					console.log(error)
					return new BetterAuthError({ error })
				},
			})

		return {
			call,
		}
	}),
}) {}
