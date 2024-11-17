import { PgDrizzle } from "@effect/sql-drizzle/Pg"
import { eq, schema } from "db"
import { Effect } from "effect"
import { NotFound } from "~/errors"
import { DrizzleLive } from "~/services/db-service"
import { PlaidService } from "~/services/plaid-service"
import { AccountRepo } from "./account-repo"
import { TransactionRepo } from "./transaction-repo"

export class TransactionService extends Effect.Service<TransactionService>()("TransactionService", {
	effect: Effect.gen(function* () {
		const accountRepo = yield* AccountRepo
		const transactionRepo = yield* TransactionRepo
		const plaid = yield* PlaidService

		return {
			updateTransactions: (plaidItemId: string) =>
				Effect.gen(function* () {
					const { added, modified, removed, cursor, accessToken } =
						yield* fetchTransactionUpdates(plaidItemId)

					const connectedAccounts = yield* plaid.call((client, signal) =>
						client.accountsGet({ access_token: accessToken }, { signal }),
					)

					// TODO: Make this conccurent maybe?
					yield* accountRepo.createAccounts(plaidItemId, connectedAccounts.data.accounts)
					yield* transactionRepo.upsertTransactions([...added, ...modified])
					yield* transactionRepo.deleteTransactions(removed)

					yield* Effect.logDebug("Added transactions", added.length)
					yield* Effect.logDebug("Modified transactions", modified.length)
					yield* Effect.logDebug("Removed transactions", removed.length)
					yield* Effect.logDebug("Cursor", cursor)
					yield* Effect.logDebug("Access token", accessToken)

					return {
						addedCount: added.length,
						modifiedCount: modified.length,
						removedCount: removed.length,
					}
				}),
		}
	}),
	dependencies: [DrizzleLive, PlaidService.Default, AccountRepo.Default, TransactionRepo.Default],
}) {}

/**
 * Fetches transactions from the Plaid API for a given item.
 *
 * @param {string} plaidItemId the Plaid ID for the item.
 * @returns {Object{}} an object containing transactions and a cursor.
 */
const fetchTransactionUpdates = (plaidItemId: string) =>
	Effect.gen(function* () {
		const db = yield* PgDrizzle
		const plaid = yield* PlaidService

		const plaidItem = (yield* db.select().from(schema.plaidItem).where(eq(schema.plaidItem.id, plaidItemId)))[0]

		if (!plaidItem) {
			return yield* Effect.fail(new NotFound({ message: "Item not found" }))
		}

		const accessToken = plaidItem.accessToken

		let cursor = plaidItem.transactionsCursor || undefined

		// New transaction updates since "cursor"
		const added = []
		const modified = []
		// Removed transaction ids
		const removed = []
		let hasMore = true

		const batchSize = 100

		while (hasMore) {
			const request = {
				access_token: accessToken,
				cursor: cursor,
				count: batchSize,
			}
			const { data } = yield* plaid.call((client, signal) => client.transactionsSync(request, { signal }))

			added.push(...data.added)
			modified.push(...data.modified)
			removed.push(...data.removed)

			hasMore = data.has_more
			cursor = data.next_cursor
		}
		return { added, modified, removed, cursor, accessToken }
	})
