import { PgDrizzle } from "@effect/sql-drizzle/Pg"
import { type InsertBankAccount, schema, sql } from "db"
import { Effect } from "effect"
import type { AccountBase, Transaction } from "plaid"
import { DrizzleLive } from "~/services/db-service"

export class AccountRepo extends Effect.Service<AccountRepo>()("AccountRepo", {
	effect: Effect.gen(function* () {
		const db = yield* PgDrizzle

		return {
			// TODO: Use a branded type to ensure that the id is a plaiditemId
			createAccounts: (plaidItemId: string, accounts: AccountBase[]) =>
				Effect.gen(function* () {
					const mappedItems: InsertBankAccount[] = accounts.map(
						(account) =>
							({
								id: account.account_id,
								name: account.name,
								officialName: account.official_name,
								mask: account.mask,
								type: account.type,
								plaidItemId: plaidItemId,

								currentBalance: account.balances.current?.toString(),
								availableBalance: account.balances.available?.toString(),
								limit: account.balances.limit?.toString(),

								isoCurrencyCode: account.balances.iso_currency_code,
								unofficialCurrencyCode: account.balances.unofficial_currency_code,
							}) satisfies InsertBankAccount,
					)

					return yield* db
						.insert(schema.bankAccount)
						.values(mappedItems)
						.onConflictDoUpdate({
							target: schema.bankAccount.id,
							set: {
								name: sql.raw(`excluded.${schema.bankAccount.name.name}`),
								officialName: sql.raw(`excluded.${schema.bankAccount.officialName.name}`),

								currentBalance: sql.raw(`excluded.${schema.bankAccount.currentBalance.name}`),
								availableBalance: sql.raw(`excluded.${schema.bankAccount.availableBalance.name}`),
								limit: sql.raw(`excluded.${schema.bankAccount.limit.name}`),

								isoCurrencyCode: sql.raw(`excluded.${schema.bankAccount.isoCurrencyCode.name}`),
								unofficialCurrencyCode: sql.raw(
									`excluded.${schema.bankAccount.unofficialCurrencyCode.name}`,
								),
							},
						})
						.returning()
				}),
		}
	}),
	dependencies: [DrizzleLive],
}) {}
