import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"
import { Api } from "~/api"

export const HttpGoCardlessLive = HttpApiBuilder.group(Api, "gocardless", (handlers) =>
	handlers.handle("getInstitutions", ({ path }) =>
		Effect.gen(function* () {
			return yield* Effect.succeed("WOW")
		}),
	),
)
