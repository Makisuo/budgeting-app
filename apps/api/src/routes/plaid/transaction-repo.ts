import { PgDrizzle } from "@effect/sql-drizzle/Pg"
import { type InsertTransaction, inArray, schema, sql } from "db"
import { Effect } from "effect"
import { DrizzleLive } from "~/services/db-service"

import type { Transaction as PlaidTransaction, RemovedTransaction } from "plaid"

export class TransactionRepo extends Effect.Service<TransactionRepo>()("TransactionRepo", {
	effect: Effect.gen(function* () {
		const db = yield* PgDrizzle

		return {
			// TODO: Use a branded type to ensure that the id is a plaiditemId
			upsertTransactions: (transactions: PlaidTransaction[]) =>
				Effect.gen(function* () {
					const dbTransactions: InsertTransaction[] = transactions.map(
						(transaction) =>
							({
								accountId: transaction.account_id,
								id: transaction.transaction_id,
								website: transaction.website,
								logoUrl: transaction.logo_url,
								personalCategory: transaction.personal_finance_category?.primary,
								amount: transaction.amount.toString(),
								isoCurrencyCode: transaction.iso_currency_code,
								unofficalCurrencyCode: transaction.unofficial_currency_code,

								location: transaction.location,

								name: transaction.name,
								description: transaction.original_description,

								// Dates
								date: transaction.date,
								authorizedAt: transaction.authorized_datetime,
								postedAt: transaction.datetime,

								pending: transaction.pending,
								accountOwner: transaction.account_owner,
							}) satisfies InsertTransaction,
					)

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
			deleteTransactions: (arrays: RemovedTransaction[]) =>
				Effect.gen(function* () {
					yield* db.delete(schema.transaction).where(
						inArray(
							schema.transaction.id,
							arrays.map((item) => item.transaction_id),
						),
					)
				}),
		}
	}),
	dependencies: [DrizzleLive],
}) {}
