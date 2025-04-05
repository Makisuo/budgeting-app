import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"
import { Api } from "~/worker/api"

export const HttpSubscriptionLive = HttpApiBuilder.group(Api, "Subscriptions", (handlers) =>
	Effect.gen(function* () {
		return handlers.handle("create", ({ payload }) =>
			Effect.gen(function* () {
				// yield* subscriptionRepo.insert({
				// 	status: "active",
				// })
				return yield* Effect.succeed("OK")
			}),
		)
	}),
)
