import { Config } from "effect"

export const IsDevelopment = Config.boolean("isDev").pipe(
	Config.orElse(() =>
		Config.succeed(typeof process !== "undefined" ? process.env.NODE_ENV : undefined).pipe(
			Config.map((_) => _ === "development"),
		),
	),
	Config.withDefault(false),
)
