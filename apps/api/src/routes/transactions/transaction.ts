import { Effect, Option, pipe } from "effect"
import { type Transaction, type TransactionId, TransactionNotFound } from "~/models/transaction"
import { TransactionRepo } from "~/repositories/transaction-repo"

export class TransactionHelper extends Effect.Service<TransactionHelper>()("@Maple/TransactionHelper", {
	effect: Effect.gen(function* () {
		const transactionRepo = yield* TransactionRepo

		const update = (transaction: Transaction, update: Partial<typeof Transaction.jsonUpdate.Type>) =>
			pipe(
				transactionRepo.update({
					...transaction,
					...update,
					updatedAt: undefined,
				}),
				Effect.withSpan("Transaction.update", {
					attributes: { id: transaction.id, update },
				}),
				// policyRequire("Transaction", "update"),
			)

		const with_ = <A, E, R>(
			id: TransactionId,
			f: (app: Transaction) => Effect.Effect<A, E, R>,
		): Effect.Effect<A, E | TransactionNotFound, R> =>
			pipe(
				transactionRepo.findById(id),
				Effect.flatMap(
					Option.match({
						onNone: () => new TransactionNotFound({ id }),
						onSome: Effect.succeed,
					}),
				),
				Effect.flatMap(f),
				// Disabled since we are using D1
				//sql.withTransaction,
				// Effect.catchTag("SqlError", (err) => Effect.die(err)),
				Effect.withSpan("App.with", { attributes: { id } }),
			)

		return {
			update,
			with: with_,
		}
	}),

	dependencies: [TransactionRepo.Default],
}) {}
