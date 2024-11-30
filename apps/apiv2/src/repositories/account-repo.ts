import { Effect, Schema } from "effect"

import { Model, SqlClient } from "@effect/sql"
import { Account } from "~/models/account"
import { SqlLive } from "~/services/sql"

const TABLE_NAME = "accounts"
const SPAN_PREFIX = "AccountRepo"

export class AccountRepo extends Effect.Service<AccountRepo>()("AccountRepo", {
	effect: Effect.gen(function* () {
		const sql = yield* SqlClient.SqlClient

		const baseRepository = yield* Model.makeRepository(Account, {
			tableName: TABLE_NAME,
			spanPrefix: SPAN_PREFIX,
			idColumn: "id",
		})

		return { ...baseRepository } as const
	}),
	dependencies: [SqlLive],
}) {}
