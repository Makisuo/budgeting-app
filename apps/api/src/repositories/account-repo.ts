import { Effect, Schema } from "effect"

import { Model, SqlClient, SqlSchema } from "@effect/sql"
import { Database } from "@maple/api-utils"
import { Account } from "@maple/api-utils/models"
import { SqlLive } from "~/services/sql"

const TABLE_NAME = "accounts"
const SPAN_PREFIX = "AccountRepo"

export class AccountRepo extends Effect.Service<AccountRepo>()("AccountRepo", {
	effect: Effect.gen(function* () {
		const sql = yield* SqlClient.SqlClient

		const db = yield* Database.Database

		const baseRepository = yield* Model.makeRepository(Account, {
			tableName: TABLE_NAME,
			spanPrefix: SPAN_PREFIX,
			idColumn: "id",
		})

		// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
		const getAccountsReadyForSync = db.makeQuery((execute, input: void) =>
			execute((client) =>
				client.query.accounts.findMany({
					where: (table, { isNull, or, sql }) =>
						or(isNull(table.lastSync), sql`${table.lastSync} < NOW() - INTERVAL '6 hours'`),
				}),
			),
		)

		return { ...baseRepository, getAccountsReadyForSync } as const
	}),
	dependencies: [SqlLive],
}) {}
