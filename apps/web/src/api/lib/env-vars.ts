import * as Config from "effect/Config"
import * as Effect from "effect/Effect"

export class EnvVars extends Effect.Service<EnvVars>()("EnvVars", {
	accessors: true,
	effect: Effect.gen(function* () {
		return {
			IS_DEV: yield* Config.boolean("IS_DEV").pipe(Config.withDefault(false)),
			LOG_LEVEL: yield* Config.string("LOG_LEVEL"),
			GO_CARDLESS_SECRET_ID: yield* Config.redacted("GO_CARDLESS_SECRET_ID"),
			GO_CARDLESS_SECRET_KEY: yield* Config.redacted("GO_CARDLESS_SECRET_KEY"),

			VITE_BASE_URL: yield* Config.string("VITE_BASE_URL").pipe(Config.withDefault("http://localhost:3000")),

			BETTER_AUTH_SECRET: yield* Config.redacted("BETTER_AUTH_SECRET"),

			GOOGLE_CLIENT_ID: yield* Config.string("GOOGLE_CLIENT_ID"),
			GOOGLE_CLIENT_SECRET: yield* Config.redacted("GOOGLE_CLIENT_SECRET"),

			DATABASE_URL: yield* Config.redacted("DATABASE_URL"),
		} as const
	}),
}) {}
