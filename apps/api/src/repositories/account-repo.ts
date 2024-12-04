import { Effect, Schema } from "effect"

import { Model, SqlClient, SqlSchema } from "@effect/sql"
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

		const getAccountsReadyForSyncSchema = SqlSchema.findAll({
			Request: Schema.Void,
			Result: Account,
			// TODO: Should be more type safe and have a dyanmic duration
			execute: () =>
				sql`SELECT *
					FROM ${sql(TABLE_NAME)}
					WHERE last_sync IS NULL OR last_sync < NOW() - INTERVAL '6 hours';`,
		})

		const getAccountsReadyForSync = () =>
			getAccountsReadyForSyncSchema().pipe(
				Effect.tapErrorTag("ParseError", (e) => Effect.logInfo(e)),
				Effect.orDie,
				Effect.withSpan(`${SPAN_PREFIX}.getAccountsReadyForSync`, {
					captureStackTrace: false,
				}),
			)

		return { ...baseRepository, getAccountsReadyForSync } as const
	}),
	dependencies: [SqlLive],
}) {}
