import { HttpApiBuilder } from "@effect/platform"
import { PgDrizzle } from "@effect/sql-drizzle/Pg"
import { Effect } from "effect"
import { Api } from "../../api"

export const HttpPlaidLive = HttpApiBuilder.group(Api, "plaid", (handlers) =>
	handlers.handle("exchangeToken", (_) =>
		Effect.gen(function* () {
			// const db = yield* PgDrizzle
			return yield* Effect.succeed("WOW")
		}),
	),
)
