import { HttpApiBuilder } from "@effect/platform"

import { PgDrizzle } from "@effect/sql-drizzle/Pg"
import { eq, schema } from "db"
import { Console, Effect } from "effect"
import { Api } from "~/api"
import { Authorization } from "~/authorization"
import { InternalError } from "../../errors"
import { PlaidService } from "../../services/plaid-service"
import { AccountRepo } from "./account-repo"
import { TransactionService } from "./transactions"

export const HttpPlaidLive = HttpApiBuilder.group(Api, "plaid", (handlers) =>
	handlers
		.handle("exchangeToken", ({ payload, headers }) =>
			Effect.gen(function* () {
				const currentUser = yield* Authorization.provides

				const db = yield* PgDrizzle

				const plaid = yield* PlaidService

				const tokenResponse = yield* plaid.call((client, signal) =>
					client.itemPublicTokenExchange(
						{ public_token: payload.publicToken },
						{
							signal,
						},
					),
				)

				const accessToken = tokenResponse.data.access_token
				const itemId = tokenResponse.data.item_id

				const item = yield* plaid.call((client, signal) =>
					client.itemGet({ access_token: accessToken }, { signal }),
				)

				/**
				 * Starts sync of transactions, sync will be triggered by webhook
				 *
				 */
				const transactions = yield* plaid.call((client, signal) =>
					client.transactionsSync({ access_token: accessToken }, { signal }),
				)

				yield* Effect.logInfo("Started Synced transactions", transactions.data)

				yield* db.insert(schema.plaidItem).values({
					id: itemId,
					institutionId: item.data.item.institution_id,
					accessToken: accessToken,
					userId: currentUser.id,
				})

				return yield* Effect.succeed("WOW")
			}).pipe(
				Effect.tapError((error) => Console.log(`expected error: ${error.stack}`)),
				Effect.catchTags({
					PlaidApiError: (error) => new InternalError({ message: error.message }),
					SqlError: (error) => new InternalError({ message: error.message }),
				}),
			),
		)
		.handle("syncBankAccounts", ({ headers }) =>
			Effect.gen(function* () {
				const db = yield* PgDrizzle

				const accountRepo = yield* AccountRepo

				const currentUser = yield* Authorization.provides

				const plaid = yield* PlaidService

				const plaidItems = yield* db
					.select()
					.from(schema.plaidItem)
					.where(eq(schema.plaidItem.userId, currentUser.id))

				yield* Effect.forEach(
					plaidItems,
					(item) =>
						Effect.gen(function* () {
							const connectedAccounts = yield* plaid.call((client, signal) =>
								client.accountsGet({ access_token: item.accessToken }, { signal }),
							)

							yield* accountRepo.createAccounts(item.id, connectedAccounts.data.accounts)
						}),
					{ concurrency: "unbounded" },
				)

				// return yield* Effect.succeed({
				// 	success: true,
				// 	message: "Synced",
				// 	numOfAccounts: plaidItems.length,
				// })
				return yield* Effect.succeed("WOW")
			}).pipe(
				Effect.tapError((error) => Console.error(error)),
				Effect.catchTags({
					PlaidApiError: (error) => new InternalError({ message: error.message }),
					SqlError: (error) => new InternalError({ message: error.message }),
				}),
			),
		)
		.handle("webhook", ({ payload }) =>
			Effect.gen(function* () {
				const transactionService = yield* TransactionService
				if (payload.webhook_type !== "TRANSACTIONS") {
					return yield* Effect.fail(new InternalError({ message: "Invalid webhook type" }))
				}

				switch (payload.webhook_code) {
					case "SYNC_UPDATES_AVAILABLE":
						yield* Effect.logInfo("sync updates available")
						yield* transactionService.updateTransactions(payload.item_id)
						return yield* Effect.succeed("sync updates available")
					case "RECURRING_TRANSACTIONS_UPDATE":
						return yield* Effect.succeed("recurring transactions update")
					case "TRANSACTIONS_REMOVED":
					case "INITIAL_UPDATE":
					case "HISTORICAL_UPDATE":
					case "DEFAULT_UPDATE":
						yield* Effect.logInfo("ignored", payload.webhook_code)
						return yield* Effect.succeed("ignored")

					default:
						yield* Effect.logWarning("Unknown webhook code", payload.webhook_code)
						return yield* Effect.fail(new InternalError({ message: "Webhook code not being handelt" }))
				}
			}).pipe(
				Effect.tapError((error) => Effect.succeed(() => console.log(error))),
				Effect.catchTags({
					PlaidApiError: (error) => new InternalError({ message: error.message }),
					SqlError: (error) => new InternalError({ message: error.message }),
				}),
			),
		),
)
