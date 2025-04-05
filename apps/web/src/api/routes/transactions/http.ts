import { HttpApiBuilder } from "@effect/platform"
import { Effect, pipe } from "effect"
import { Api } from "~/worker/api"
import { TransactionHelper } from "./transaction"

export const HttpTransactionLive = HttpApiBuilder.group(Api, "Transactions", (handlers) =>
	Effect.gen(function* () {
		const transactionHelper = yield* TransactionHelper
		return handlers.handle("update", ({ payload, path }) =>
			Effect.gen(function* () {
				const transaction = yield* transactionHelper
					.with(path.id, (app) =>
						pipe(
							transactionHelper.update(app, payload),
							// policyUse(policy.canUpdate(app))
						),
					)
					.pipe(
						// TODO: Remove later
						Effect.catchTag("ParseError", (err) => Effect.die(err)),
						Effect.catchTag("DatabaseError", (err) => Effect.die(err)),
					)

				return transaction
			}),
		)
	}),
)
