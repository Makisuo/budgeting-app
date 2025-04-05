import { Transaction } from "@maple/api-utils/models"
import { Effect, Option } from "effect"
import { CompanyRepo } from "~/worker/repositories/company-repo"
import { TransactionRepo } from "~/worker/repositories/transaction-repo"

export class TransactionHelpers extends Effect.Service<TransactionHelpers>()("TransactionHelpers", {
	effect: Effect.gen(function* () {
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

		const updateTransaction = (
			id: typeof Transaction.Id.Type,
			transaction: Partial<typeof Transaction.Model.jsonUpdate.Type>,
		) => {
			return transactionRepo.findById(id).pipe(
				Effect.flatMap(
					Option.match({
						onNone: () => new Transaction.TransactionNotFound({ id }),
						onSome: Effect.succeed,
					}),
				),
				Effect.andThen((previous) =>
					transactionRepo.update({
						...transaction,
						id,
						updatedAt: new Date(),
					}),
				),
				Effect.withSpan("Transaction.update", { attributes: { id, transaction } }),
			)
		}

		return {
			detectCompany,
			getUnidentifiedTransactions,
			updateTransaction,
		} as const
	}),
	dependencies: [CompanyRepo.Default, TransactionRepo.Default],
}) {}
