import { Effect } from "effect"

import { Model, SqlClient } from "@effect/sql"
import { Transaction } from "~/models/transaction"
import { SqlLive } from "~/services/sql"

const TABLE_NAME = "transactions"
const SPAN_PREFIX = "TransactionRepo"

export class TranscationRepo extends Effect.Service<TranscationRepo>()("TranscationRepo", {
	effect: Effect.gen(function* () {
		const sql = yield* SqlClient.SqlClient

		const baseRepository = yield* Model.makeRepository(Transaction, {
			tableName: TABLE_NAME,
			spanPrefix: SPAN_PREFIX,
			idColumn: "id",
		})

		return { ...baseRepository } as const
	}),
	dependencies: [SqlLive],
}) {}
