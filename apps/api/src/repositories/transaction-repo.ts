import { Effect, Schema } from "effect"

import { Model, SqlClient, SqlSchema } from "@effect/sql"
import { Transaction, TransactionId } from "~/models/transaction"
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

		const getUndetectedDirectTransfers = SqlSchema.findAll({
			Request: Schema.Void,
			Result: Schema.Struct({
				outgoingTxId: TransactionId,
				incomingTxId: TransactionId,
				outgoingAmount: Schema.Number,
				incomingAmount: Schema.Number,
			}),
			execute: () => sql`SELECT 
			t_out.id AS outgoing_tx_id,
			t_in.id AS incoming_tx_id,
			t_out.amount AS outgoing_amount,
			t_in.amount AS incoming_amount,
			t_out.date AS transfer_time
		  FROM 
			transactions t_out
		  JOIN 
			transactions t_in
			ON 
			  t_out.tenant_id = t_in.tenant_id
			  AND t_out.currency = t_in.currency
			  AND ABS(t_out.amount + t_in.amount) < 0.01
			  AND ABS(EXTRACT(EPOCH FROM (t_out.date - t_in.date))) < 172000 
			  AND t_out.account_id != t_in.account_id
			  AND t_out.amount < 0
			  AND t_in.amount > 0
		  WHERE
			EXISTS (SELECT 1 FROM accounts a WHERE a.id = t_out.account_id AND a.tenant_id = t_out.tenant_id)
			AND EXISTS (SELECT 1 FROM accounts a WHERE a.id = t_in.account_id AND a.tenant_id = t_in.tenant_id)
			AND t_in.direct_transfer IS NULL
			AND t_out.status = 'posted'
			AND t_in.status = 'posted'`,
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
			getUndetectedDirectTransfers,
		} as const
	}),
	dependencies: [SqlLive],
}) {}
