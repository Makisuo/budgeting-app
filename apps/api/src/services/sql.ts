import * as PgDrizzle from "@effect/sql-drizzle/Pg"
import { PgClient } from "@effect/sql-pg"
import * as Effect from "effect"
import { Config, Layer } from "effect"

export const PgLive = PgClient.layerConfig({
	url: Config.redacted("DATABASE_URL"),

	connectTimeout: Config.succeed(3000),

	// ssl: Config.boolean("isDev").pipe(
	// 	Config.orElse(() => Config.succeed(false)),
	// 	Config.map((isDev) => !isDev),
	// ),
	transformQueryNames: Config.succeed(Effect.String.camelToSnake),
	transformResultNames: Config.succeed(Effect.String.snakeToCamel),
})

const DrizzleLive = PgDrizzle.layer.pipe(Effect.Layer.provide(PgLive))

export const SqlLive = Layer.mergeAll(PgLive, DrizzleLive)
