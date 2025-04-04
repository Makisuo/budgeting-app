import { HttpApiBuilder } from "@effect/platform"
import { Account, InstitutionInsert } from "@maple/api-utils/models"
import { Effect, Option, pipe } from "effect"
import { Api } from "~/api"
import { InternalError } from "~/errors"
import { AccountRepo } from "~/repositories/account-repo"
import { InstitutionRepo } from "~/repositories/institution-repo"
import { GoCardlessService } from "~/services/gocardless/gocardless-service"
import { TransactionHelpers } from "~/services/transaction"

export const HttpAdminLive = HttpApiBuilder.group(Api, "admin", (handlers) =>
	Effect.gen(function* () {
		const goCardless = yield* GoCardlessService
		const institiutionRepo = yield* InstitutionRepo

		const transactionHelpers = yield* TransactionHelpers

		return handlers
			.handle("syncInstitutions", () =>
				Effect.gen(function* () {
					const institutions = yield* goCardless.getInstitutions(Option.none())

					const dbInstitutions = yield* Effect.forEach(institutions, (institution) =>
						// biome-ignore lint/correctness/useYield: <explanation>
						Effect.gen(function* () {
							const dbInstitutions = InstitutionInsert.make({
								id: institution.id,
								name: institution.name,
								transactionTotalDays: institution.transaction_total_days,
								logo: institution.logo,

								countries: institution.countries,

								provider: "gocardless",
								deletedAt: null,
							})

							return dbInstitutions
						}),
					)

					yield* institiutionRepo.insertMultipleVoid(dbInstitutions).pipe(Effect.tapError(Effect.logError))

					return institutions
				}).pipe(
					Effect.tapError((error) => Effect.logError(error)),
					Effect.orDie,
					Effect.withSpan("GoCardless.getInstitutions"),
				),
			)
			.handle("test", () =>
				Effect.gen(function* () {
					const accountRepo = yield* AccountRepo
					const account = yield* accountRepo
						.findById(Account.Id.make("0b4b50df-65a5-4d35-8692-ca9327c9a079"))
						.pipe(Effect.mapError(() => new InternalError({ message: "Account not found" })))
					return yield* Effect.succeed(account)
				}),
			)
			.handle("processTransactions", () =>
				Effect.gen(function* () {
					const transactions = yield* transactionHelpers.getUnidentifiedTransactions()

					yield* Effect.logInfo("Found unidentified transactions", transactions.length)

					yield* Effect.forEach(transactions, (transaction) =>
						Effect.gen(function* () {
							yield* transactionHelpers.detectCompany(transaction.name).pipe(
								Effect.flatMap(
									Option.match({
										onNone: () => Effect.succeed(null),
										onSome: (company) =>
											pipe(
												Effect.logInfo("Found company", company.name),
												Effect.flatMap(() =>
													transactionHelpers.updateTransaction(transaction.id, {
														companyId: company.id,
														name: company.name,
														categoryId: company.categoryId,
													}),
												),
											),
									}),
								),
							)

							return transaction
						}),
					)

					return transactions
				}).pipe(Effect.orDie),
			)
	}),
)
