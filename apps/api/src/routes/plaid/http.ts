import { HttpApiBuilder } from "@effect/platform"

import { PgDrizzle } from "@effect/sql-drizzle/Pg"
import { eq, schema, sql } from "db"
import type { InsertBankAccount } from "db/src/schema"
import { Console, Effect, Match } from "effect"
import { Api } from "~/api"
import { InternalError, Unauthorized } from "../../errors"
import { BetterAuthService } from "../../services/auth-service"
import { PlaidService } from "../../services/plaid-service"
import { updateTransactions } from "./transactions"

export const HttpPlaidLive = HttpApiBuilder.group(Api, "plaid", (handlers) =>
	handlers
		.handle("exchangeToken", ({ payload, headers }) =>
			Effect.gen(function* () {
				const betterAuth = yield* BetterAuthService

				const session = yield* betterAuth.call((client, signal) =>
					client.getSession({ headers: new Headers(headers), signal }),
				)

				if (!session) {
					return yield* new Unauthorized()
				}

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
				yield* plaid.call((client, signal) =>
					client.transactionsSync({ access_token: accessToken }, { signal }),
				)

				yield* db.insert(schema.plaidItem).values({
					id: itemId,
					institutionId: item.data.item.institution_id,
					accessToken: accessToken,
					userId: session.user.id,
				})

				return yield* Effect.succeed("WOW")
			}).pipe(
				Effect.tapError((error) => Console.log(`expected error: ${error.stack}`)),
				Effect.catchTags({
					BetterAuthError: (error) => new InternalError({ message: error.message }),
					PlaidApiError: (error) => new InternalError({ message: error.message }),
					SqlError: (error) => new InternalError({ message: error.message }),
				}),
			),
		)
		.handle("syncBankAccounts", ({ headers }) =>
			Effect.gen(function* () {
				const db = yield* PgDrizzle
				const betterAuth = yield* BetterAuthService

				const session = yield* betterAuth.call((client, signal) =>
					client.getSession({ headers: new Headers(headers), signal }),
				)

				if (!session) {
					return yield* new Unauthorized()
				}

				const plaid = yield* PlaidService

				const plaidItems = yield* db
					.select()
					.from(schema.plaidItem)
					.where(eq(schema.plaidItem.userId, session.user.id))

				yield* Effect.forEach(
					plaidItems,
					(item) =>
						Effect.gen(function* () {
							const connectedAccounts = yield* plaid.call((client, signal) =>
								client.accountsGet({ access_token: item.accessToken }, { signal }),
							)

							const mappedItems: InsertBankAccount[] = connectedAccounts.data.accounts.map((account) => ({
								id: account.account_id,
								name: account.name,
								officialName: account.official_name,
								mask: account.mask,
								userId: session.user.id,
								balance: account.balances,
								type: account.type,
								plaidItemId: item.id,
							}))

							yield* db
								.insert(schema.bankAccount)
								.values(mappedItems)
								.onConflictDoUpdate({
									target: schema.bankAccount.id,
									set: {
										name: sql.raw(`excluded.${schema.bankAccount.name.name}`),
										officialName: sql.raw(`excluded.${schema.bankAccount.officialName.name}`),
										mask: sql.raw(`excluded.${schema.bankAccount.mask.name}`),
										balance: sql.raw(`excluded.${schema.bankAccount.balance.name}`),
										type: sql.raw(`excluded.${schema.bankAccount.type.name}`),
									},
								})
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
					BetterAuthError: (error) => new InternalError({ message: error.message }),
				}),
			),
		)
		.handle("webhook", ({ payload }) =>
			Effect.gen(function* () {
				console.log(payload.webhook_type, payload.webhook_code)
				if (payload.webhook_type !== "TRANSACTIONS") {
					return yield* Effect.fail(new InternalError({ message: "Invalid webhook type" }))
				}

				switch (payload.webhook_code) {
					case "SYNC_UPDATES_AVAILABLE":
						yield* Effect.logInfo("sync updates available")
						yield* updateTransactions(payload.item_id)
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
