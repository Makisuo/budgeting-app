import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"
import { Api } from "~/api"
import { SubscriptionRepo } from "~/repositories/subscription-repo"

export const HttpRootLive = HttpApiBuilder.group(Api, "Subscriptions", (handlers) =>
	Effect.gen(function* () {
		const subscriptionRepo = yield* SubscriptionRepo
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
