import { HttpApiBuilder } from "@effect/platform"
import { Effect, pipe } from "effect"
import { Api } from "~/api"
import { TransactionHelper } from "./transaction"

export const HttpTransactionLive = HttpApiBuilder.group(Api, "Transactions", (handlers) =>
	Effect.gen(function* () {
		const transactionHelper = yield* TransactionHelper
		return handlers.handle("update", ({ payload, path }) =>
			transactionHelper.with(path.id, (app) =>
				pipe(
					transactionHelper.update(app, payload),
					// policyUse(policy.canUpdate(app))
				),
			),
		)
	}),
)
