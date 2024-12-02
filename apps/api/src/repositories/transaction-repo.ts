import { Effect, Schema } from "effect"

import { Model, SqlClient, SqlSchema } from "@effect/sql"
import { Transaction } from "~/models/transaction"
import { SqlLive } from "~/services/sql"

const TABLE_NAME = "transactions"
const SPAN_PREFIX = "TransactionRepo"

export class TranscationRepo extends Effect.Service<TranscationRepo>()("TranscationRepo", {
	effect: Effect.gen(function* () {
		const sql = yield* SqlClient.SqlClient

		const insertMultipleVoidSchema = SqlSchema.void({
			Request: Schema.Array(Transaction.insert),
			execute: (request) => sql`insert into ${sql(TABLE_NAME)} ${sql.insert(request)}`,
		})
		const insertMultipleVoid = (insert: (typeof Transaction.insert.Type)[]) =>
			insertMultipleVoidSchema(insert).pipe(
				Effect.orDie,
				Effect.withSpan(`${SPAN_PREFIX}.insertMultipleVoid`, {
					captureStackTrace: false,
					attributes: { insert },
				}),
			)

		const baseRepository = yield* Model.makeRepository(Transaction, {
			tableName: TABLE_NAME,
			spanPrefix: SPAN_PREFIX,
			idColumn: "id",
		})

		return { ...baseRepository, insertMultipleVoid } as const
	}),
	dependencies: [SqlLive],
}) {}