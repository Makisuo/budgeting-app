import { HttpApiBuilder } from "@effect/platform"

import { Config, Effect } from "effect"
import { Api } from "../../api"

export const HttpBaseLive = HttpApiBuilder.group(Api, "helloWorld", (handlers) =>
	handlers.handle("helloWorld", (_) =>
		Effect.gen(function* () {
			return yield* Effect.succeed("Hello World!")
		}),
	),
)
