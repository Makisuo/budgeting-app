import { Transaction } from "@maple/api-utils/models"
import { Effect, Option, pipe } from "effect"
import { TransactionRepo } from "~/worker/repositories/transaction-repo"

export class TransactionHelper extends Effect.Service<TransactionHelper>()("@Maple/TransactionHelper", {
	effect: Effect.gen(function* () {
		const transactionRepo = yield* TransactionRepo

		const update = (transaction: Transaction.Model, update: Partial<typeof Transaction.Model.jsonUpdate.Type>) =>
			pipe(
				transactionRepo.update({
					...transaction,
					...update,
					updatedAt: new Date(),
				}),
				Effect.withSpan("Transaction.update", {
					attributes: { id: transaction.id, update },
				}),
				// policyRequire("Transaction", "update"),
			)

		const with_ = <A, E, R>(
			id: typeof Transaction.Id.Type,
			f: (app: Transaction.Model) => Effect.Effect<A, E, R>,
		): Effect.Effect<A, E | Transaction.TransactionNotFound, R> =>
			pipe(
				transactionRepo.findById(id),
				Effect.flatMap(
					Option.match({
						onNone: () => new Transaction.TransactionNotFound({ id }),
						onSome: Effect.succeed,
					}),
				),
				Effect.flatMap(f),
				// Disabled since we are using D1
				//sql.withTransaction,
				Effect.catchTag("DatabaseError", (err) => Effect.die(err)),
				Effect.withSpan("App.with", { attributes: { id } }),
			)

		return {
			update,
			with: with_,
		}
	}),

	dependencies: [TransactionRepo.Default],
}) {}
