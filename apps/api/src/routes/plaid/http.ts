import { HttpApiBuilder } from "@effect/platform"

import { PgDrizzle } from "@effect/sql-drizzle/Pg"
import { schema } from "db"
import { Console, Effect } from "effect"
import { Api } from "../../api"
import { InternalError, Unauthorized } from "../../errors"
import { BetterAuthService } from "../../services/auth-service"
import { PlaidService } from "../../services/plaid-service"

export const HttpPlaidLive = HttpApiBuilder.group(Api, "plaid", (handlers) =>
	handlers.handle("exchangeToken", ({ payload, headers }) =>
		Effect.gen(function* () {
			const betterAuth = yield* BetterAuthService

			const session = yield* betterAuth.call((client, signal) =>
				client.getSession({ headers: new Headers(headers) }),
			)

			if (!session) {
				return yield* new Unauthorized()
			}

			const db = yield* PgDrizzle

			const plaid = yield* PlaidService

			const tokenResponse = yield* plaid.call((client, signal) =>
				client.itemPublicTokenExchange({ public_token: payload.publicToken }),
			)

			const accessToken = tokenResponse.data.access_token
			const itemId = tokenResponse.data.item_id

			yield* db.insert(schema.plaidItem).values({
				id: itemId,
				accessToken: accessToken,
				userId: session.user.id,
			})

			return yield* Effect.succeed("WOW")
		}).pipe(
			Effect.tapError((error) => Console.log(`expected error: ${error}`)),
			Effect.catchTags({
				BetterAuthError: (error) => new InternalError({ error }),
				PlaidApiError: (error) => new InternalError({ error }),
				SqlError: (error) => new InternalError({ error }),
			}),
		),
	),
)
