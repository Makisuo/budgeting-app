import { HttpApiBuilder } from "@effect/platform"

import { PgDrizzle } from "@effect/sql-drizzle/Pg"
import { auth, schema } from "db"
import { Effect } from "effect"
import { Api } from "../../api"
import { InternalError, Unauthorized } from "../../errors"
import { PlaidService } from "../../services/plaid-service"

export const HttpPlaidLive = HttpApiBuilder.group(Api, "plaid", (handlers) =>
	handlers.handle("exchangeToken", ({ payload, headers }) =>
		Effect.gen(function* () {
			const session = yield* Effect.tryPromise({
				try: () => auth.api.getSession({ headers: headers }),
				catch: (error) => new Unauthorized({ error }),
			})

			console.log(session)

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
				userId: "placeholder",
			})

			return yield* Effect.succeed("WOW")
		}).pipe(
			Effect.catchTags({
				PlaidApiError: (error) => new InternalError({ error }),
				SqlError: (error) => new InternalError({ error }),
			}),
		),
	),
)
