import { Effect } from "effect"
import { CompanyRepo } from "~/repositories/company-repo"

export class TransactionService extends Effect.Service<TransactionService>()("TransactionService", {
	effect: Effect.gen(function* () {
		const companyRepo = yield* CompanyRepo

		const detectCompany = Effect.fn("detectCompany")(function* (transactionName: string) {
			yield* Effect.annotateCurrentSpan("transactionName", transactionName)

			const company = yield* companyRepo.findByPattern(transactionName)

			return company
		})

		return {
			detectCompany,
		}
	}),
	dependencies: [CompanyRepo.Default],
}) {}
