import { SqlClient } from "@effect/sql"
import { Effect, Option } from "effect"
import { type Transaction, type TransactionId, TransactionNotFound } from "~/models/transaction"
import { CompanyRepo } from "~/repositories/company-repo"
import { TransactionRepo } from "~/repositories/transaction-repo"
import { SqlLive } from "./sql"

export class TransactionHelpers extends Effect.Service<TransactionHelpers>()("TransactionHelpers", {
	effect: Effect.gen(function* () {
		const sql = yield* SqlClient.SqlClient
		const companyRepo = yield* CompanyRepo
		const transactionRepo = yield* TransactionRepo

		const detectCompany = Effect.fn("detectCompany")(function* (transactionName: string) {
			yield* Effect.annotateCurrentSpan("transactionName", transactionName)

			const company = yield* companyRepo.findByPattern(transactionName)

			return company
		})

		const getUnidentifiedTransactions = Effect.fn("getTransactions")(function* () {
			const transactions = yield* transactionRepo.findUnidentifiedTransactions()

			return transactions
		})

		const updateTransaction = (id: TransactionId, transaction: Partial<typeof Transaction.jsonUpdate.Type>) => {
			return transactionRepo.findById(id).pipe(
				Effect.flatMap(
					Option.match({
						onNone: () => new TransactionNotFound({ id }),
						onSome: Effect.succeed,
					}),
				),
				Effect.andThen((previous) =>
					transactionRepo.update({
						...previous,
						...transaction,
						id,
						updatedAt: undefined,
					}),
				),
				sql.withTransaction,
				Effect.catchTag("SqlError", (err) => Effect.die(err)),
				Effect.withSpan("Transaction.update", { attributes: { id, transaction } }),
			)
		}

		return {
			detectCompany,
			getUnidentifiedTransactions,
			updateTransaction,
		} as const
	}),
	dependencies: [CompanyRepo.Default, TransactionRepo.Default, SqlLive],
}) {}
