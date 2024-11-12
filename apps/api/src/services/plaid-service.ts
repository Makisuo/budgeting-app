import { HttpApiSchema } from "@effect/platform"
import { Config, Effect, Schema } from "effect"
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid"

export class PlaidApiError extends Schema.TaggedError<PlaidApiError>()(
	"PlaidApiError",
	{},
	HttpApiSchema.annotations({ status: 500 }),
) {}

export class PlaidService extends Effect.Service<PlaidService>()("PlaidService", {
	effect: Effect.gen(function* () {
		yield* Effect.log("creating PlaidService")

		const plaidEnv = yield* Config.string("PLAID_ENV")
		const plaidClientId = yield* Config.string("PLAID_CLIENT_ID")
		const plaidSecret = yield* Config.redacted("PLAID_SECRET")

		const configuration = new Configuration({
			basePath: PlaidEnvironments[plaidEnv],
			baseOptions: {
				headers: {
					"PLAID-CLIENT-ID": plaidClientId,
					"PLAID-SECRET": plaidSecret,
				},
			},
		})

		const plaidClient = new PlaidApi(configuration)

		const call = <A>(f: (client: PlaidApi, signal: AbortSignal) => Promise<A>) =>
			Effect.tryPromise({
				try: (signal) => f(plaidClient, signal),
				catch: (error) => new PlaidApiError({ error }),
			})

		return {
			call,
		}
	}),
}) {}
