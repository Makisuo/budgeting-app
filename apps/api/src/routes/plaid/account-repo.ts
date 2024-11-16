import { PgDrizzle } from "@effect/sql-drizzle/Pg"
import { type InsertBankAccount, schema, sql } from "db"
import { Effect } from "effect"
import { DrizzleLive } from "~/services/db-service"

export class AccountRepo extends Effect.Service<AccountRepo>()("AccountRepo", {
	effect: Effect.gen(function* () {
		const db = yield* PgDrizzle

		return {
			// TODO: Use a branded type to ensure that the id is a plaiditemId
			createAccounts: (accounts: InsertBankAccount[]) =>
				db
					.insert(schema.bankAccount)
					.values(accounts)
					.onConflictDoUpdate({
						target: schema.bankAccount.id,
						set: {
							name: sql.raw(`excluded.${schema.bankAccount.name.name}`),
							officialName: sql.raw(`excluded.${schema.bankAccount.officialName.name}`),
							balance: sql.raw(`excluded.${schema.bankAccount.balance.name}`),
						},
					})
					.returning(),
		}
	}),
	dependencies: [DrizzleLive],
}) {}
