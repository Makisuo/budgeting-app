import { HttpApiBuilder } from "@effect/platform"

import { PgDrizzle } from "@effect/sql-drizzle/Pg"
import { Effect } from "effect"
import { Api } from "../../api"

export const HttpPlaidLive = HttpApiBuilder.group(Api, "plaid", (handlers) =>
	handlers.handle("exchangeToken", ({ payload, headers }) =>
		Effect.gen(function* () {
			const db = yield* PgDrizzle

			console.log(headers)

			return yield* Effect.succeed("WOW")
		}),
	),
)
