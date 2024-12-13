import { Config, Effect, Layer, LogLevel, Logger } from "effect"
import { InternalError } from "~/errors"
import { IsDevelopment } from "~/lib/config"

export const LogFormat = Config.literal("json", "logFmt", "structured", "pretty")("logFormat")

export const withMinimalLogLevel = Config.logLevel("LOG_LEVEL").pipe(
	Config.withDefault(LogLevel.Info),
	Effect.andThen((level) => Logger.minimumLogLevel(level)),
	Effect.tapError((e) => Effect.logError("Invalid log level").pipe(Effect.annotateLogs("error", e))),
	Effect.catchTag(
		"ConfigError",
		(e) =>
			new InternalError({
				message: "Invalid server configuration",
			}),
	),
	Layer.unwrapEffect,
)

export const withLogFormat = Effect.gen(function* () {
	const isDev = yield* IsDevelopment
	const logFormat = yield* LogFormat.pipe(Config.withDefault(isDev ? "pretty" : "json"))
	return Logger[logFormat]
}).pipe(
	Effect.catchTag(
		"ConfigError",
		(e) =>
			new InternalError({
				message: "Invalid server configuration",
			}),
	),
	Layer.unwrapEffect,
)
