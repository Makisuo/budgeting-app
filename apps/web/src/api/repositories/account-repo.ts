import { Effect } from "effect"

import { Database, ModelRepository } from "@maple/api-utils"
import { Account } from "@maple/api-utils/models"
import { schema } from "db"

export class AccountRepo extends Effect.Service<AccountRepo>()("AccountRepo", {
	effect: Effect.gen(function* () {
		const db = yield* Database.Database

		const getAccountsReadyForSync = db.makeQuery((execute, input: void) =>
			execute((client) =>
				client.query.accounts.findMany({
					where: (table, { isNull, or, sql }) =>
						or(isNull(table.lastSync), sql`${table.lastSync} < NOW() - INTERVAL '6 hours'`),
				}),
			),
		)

		const baseRepo = yield* ModelRepository.makeRepository(schema.accounts, Account.Model, {
			idColumn: "id",
		})

		return { getAccountsReadyForSync, ...baseRepo } as const
	}),
	dependencies: [],
}) {}
