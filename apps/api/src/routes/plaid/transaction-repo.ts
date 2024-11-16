import { PgDrizzle } from "@effect/sql-drizzle/Pg"
import { type InsertTransaction, schema, sql } from "db"
import { Effect } from "effect"
import { DrizzleLive } from "~/services/db-service"

import type { Transaction as PlaidTransaction } from "plaid"

export class TransactionRepo extends Effect.Service<TransactionRepo>()("TransactionRepo", {
	effect: Effect.gen(function* () {
		const db = yield* PgDrizzle

		return {
			// TODO: Use a branded type to ensure that the id is a plaiditemId
			upsertTransactions: (transactions: PlaidTransaction[]) =>
				Effect.gen(function* () {
					const dbTransactions: InsertTransaction[] = transactions.map((transaction) => ({
						accountId: transaction.account_id,
						id: transaction.transaction_id,
						website: transaction.website,
						logoUrl: transaction.logo_url,
						name: transaction.name,
						amount: transaction.amount.toString(),
						isoCurrencyCode: transaction.iso_currency_code,
						unofficalCurrencyCode: transaction.unofficial_currency_code,
						date: transaction.date,
						pending: transaction.pending,
						accountOwner: transaction.account_owner,
					}))

					yield* db
						.insert(schema.transaction)
						.values(dbTransactions)
						.onConflictDoUpdate({
							target: schema.transaction.id,
							set: {
								name: sql.raw(`excluded.${schema.transaction.name.name}`),
								amount: sql.raw(`excluded.${schema.transaction.amount.name}`),
								isoCurrencyCode: sql.raw(`excluded.${schema.transaction.isoCurrencyCode.name}`),
								unofficalCurrencyCode: sql.raw(
									`excluded.${schema.transaction.unofficalCurrencyCode.name}`,
								),
								date: sql.raw(`excluded.${schema.transaction.date.name}`),
								pending: sql.raw(`excluded.${schema.transaction.pending.name}`),
								accountOwner: sql.raw(`excluded.${schema.transaction.accountOwner.name}`),
							},
						})
				}),
		}
	}),
	dependencies: [DrizzleLive],
}) {}
