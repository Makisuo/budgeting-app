import { PgClient } from "@effect/sql-pg"
import * as Effect from "effect"
import { Config } from "effect"

export const PgLive = PgClient.layerConfig({
	url: Config.redacted("DATABASE_URL"),
	// ssl: Config.boolean("isDev").pipe(
	// 	Config.orElse(() => Config.succeed(false)),
	// 	Config.map((isDev) => !isDev),
	// ),
	transformQueryNames: Config.succeed(Effect.String.camelToSnake),
	transformResultNames: Config.succeed(Effect.String.snakeToCamel),
})

export const SqlLive = PgLive.pipe()
