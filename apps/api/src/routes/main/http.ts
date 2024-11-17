import { HttpApiBuilder } from "@effect/platform"

import { Effect } from "effect"
import { Api } from "../../api"

export const HttpBaseLive = HttpApiBuilder.group(Api, "api", (handlers) =>
	handlers.handle("healthCheck", (_) =>
		Effect.gen(function* () {
			return yield* Effect.succeed("Healthy!")
		}),
	),
)
