import { Effect, Schema } from "effect"

import { Model, SqlClient, SqlSchema } from "@effect/sql"
import { Transaction } from "~/models/transaction"
import { SqlLive } from "~/services/sql"

const TABLE_NAME = "transactions"
const SPAN_PREFIX = "TransactionRepo"

export class TransactionRepo extends Effect.Service<TransactionRepo>()("TransactionRepo", {
	effect: Effect.gen(function* () {
		const sql = yield* SqlClient.SqlClient

		const findUnidentifiedTransactions = SqlSchema.findAll({
			Request: Schema.Void,
			Result: Transaction,
			execute: () => sql`SELECT * FROM ${sql(TABLE_NAME)} WHERE company_id IS NULL`,
		})

		const deleteOldPendingTransactions = SqlSchema.void({
			Request: Schema.Void,
			execute: () => sql`DELETE FROM ${sql(TABLE_NAME)} WHERE status = 'pending' AND date < NOW()`,
		})

		const insertMultipleVoidSchema = SqlSchema.void({
			Request: Schema.Array(Transaction.insert),
			// TODO: This should update later on its fine for now though
			execute: (request) => sql`INSERT INTO ${sql(TABLE_NAME)} ${sql.insert(request)}
			ON CONFLICT (id) DO NOTHING`,
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

		return {
			...baseRepository,
			insertMultipleVoid,
			findUnidentifiedTransactions,
			deleteOldPendingTransactions,
		} as const
	}),
	dependencies: [SqlLive],
}) {}
