import { PgClient } from "@effect/sql-pg"
import { Config, ConfigError, Layer } from "effect"

import * as PgDrizzle from "@effect/sql-drizzle/Pg"

import { MapleError } from "../errors"

const PgLive = PgClient.layerConfig({
	url: Config.redacted("DATABASE_URL"),
})

const MappedPgLive = Layer.mapError(PgLive, (err) => {
	if (ConfigError.isConfigError(err)) {
		return new MapleError({
			code: "INVALID_SERVER_CONFIG",
			message: "Invalid Server Config",
			cause: err,
		})
	}

	return new MapleError({
		code: "CANNOT_REACH_SERVER",
		message: err.message,
		cause: err.cause,
	})
})

export const DrizzleLive = PgDrizzle.layer.pipe(Layer.provide(MappedPgLive))
