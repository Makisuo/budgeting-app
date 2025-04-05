import { Effect, Schema } from "effect"

import { Database, ModelRepository } from "@maple/api-utils"
import { Transaction } from "@maple/api-utils/models"
import { schema } from "db"
import { and, eq, exists, gt, isNull, lt, ne, sql } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"

export class TransactionRepo extends Effect.Service<TransactionRepo>()("TransactionRepo", {
	effect: Effect.gen(function* () {
		const db = yield* Database.Database

		const baseRepository = yield* ModelRepository.makeRepository(schema.transactions, Transaction.Model, {
			idColumn: "id",
		})

		const findUnidentifiedTransactions = db.makeQuery((execute, input: void) =>
			execute((client) =>
				client.query.transactions.findMany({
					where: (table, { isNull }) => isNull(table.companyId),
				}),
			),
		)

		const deleteOldPendingTransactions = db.makeQuery((execute, input: void) =>
			execute((client) =>
				client
					.delete(schema.transactions)
					.where(and(lt(schema.transactions.date, new Date()), eq(schema.transactions.status, "pending"))),
			),
		)

		const insertMultipleVoid = db.makeQueryWithSchema(Schema.Array(Transaction.Model.insert), (execute, input) =>
			execute((client) =>
				client
					.insert(schema.transactions)
					.values([...input])
					.onConflictDoNothing(),
			),
		)

		const getUndetectedDirectTransfers = db.makeQuery((execute, _: void) =>
			execute((client) => {
				const tOut = alias(schema.transactions, "t_out")
				const tIn = alias(schema.transactions, "t_in")
				return client
					.select({
						outgoingTxId: tOut.id,
						incomingTxId: tIn.id,
						outgoingAmount: tOut.amount,
						incomingAmount: tIn.amount,
						transferTime: tOut.date,
					})
					.from(tOut)
					.innerJoin(
						tIn,
						and(
							eq(tOut.tenantId, tIn.tenantId),
							eq(tOut.currency, tIn.currency),
							// ABS(t_out.amount + t_in.amount) < 0.01
							lt(sql<number>`abs(${tOut.amount} + ${tIn.amount})`, 0.01),
							// ABS(EXTRACT(EPOCH FROM (t_out.date - t_in.date))) < 172000
							lt(sql<number>`abs(extract(epoch from (${tOut.date} - ${tIn.date})))`, 172000),
							ne(tOut.accountId, tIn.accountId),
							lt(tOut.amount, 0),
							gt(tIn.amount, 0),
						),
					)
					.where(
						and(
							// WHERE conditions:
							// EXISTS (SELECT 1 FROM accounts a WHERE a.id = t_out.account_id AND a.tenant_id = t_out.tenant_id)
							exists(
								client
									.select({ _: sql`1` }) // Select a dummy value for EXISTS
									.from(schema.accounts)
									.where(
										and(
											eq(schema.accounts.id, tOut.accountId),
											eq(schema.accounts.tenantId, tOut.tenantId), // Ensure tenant match in subquery
										),
									),
							),
							// EXISTS (SELECT 1 FROM accounts a WHERE a.id = t_in.account_id AND a.tenant_id = t_in.tenant_id)
							exists(
								client
									.select({ _: sql`1` })
									.from(schema.account)
									.where(
										and(
											eq(schema.accounts.id, tIn.accountId),
											eq(schema.accounts.tenantId, tIn.tenantId), // Ensure tenant match in subquery
										),
									),
							),
							isNull(tIn.directTransfer), // t_in.direct_transfer IS NULL
							eq(tOut.status, "posted"), // t_out.status = 'posted'
							eq(tIn.status, "posted"), // t_in.status = 'posted'
						),
					)
			}),
		)

		return {
			...baseRepository,
			insertMultipleVoid,
			findUnidentifiedTransactions,
			deleteOldPendingTransactions,
			getUndetectedDirectTransfers,
		} as const
	}),
	dependencies: [],
}) {}
