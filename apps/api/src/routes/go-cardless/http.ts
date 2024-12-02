import { HttpApiBuilder, HttpApp, HttpServerResponse } from "@effect/platform"
import { Arbitrary, Effect, FastCheck, Option, Schema, pipe } from "effect"
import { Api } from "~/api"
import { NotFound } from "~/errors"
import { Account } from "~/models/account"
import { ReferenceId, Requisition } from "~/models/requistion"
import { AccountRepo } from "~/repositories/account-repo"
import { InstitutionRepo } from "~/repositories/institution-repo"
import { RequisitionRepo } from "~/repositories/requisition-repo"
import { TranscationRepo } from "~/repositories/transaction-repo"
import { GoCardlessService } from "~/services/gocardless/gocardless-service"
import { transformTransaction } from "~/services/gocardless/transformer"
import { CreateLinkResponse } from "./models"

export const HttpGoCardlessLive = HttpApiBuilder.group(Api, "gocardless", (handlers) =>
	Effect.gen(function* () {
		const goCardless = yield* GoCardlessService

		const institutionRepo = yield* InstitutionRepo
		const requisitionRepo = yield* RequisitionRepo
		const accountRepo = yield* AccountRepo
		const transactionRepo = yield* TranscationRepo

		return handlers
			.handle("createLink", ({ payload }) =>
				Effect.gen(function* () {
					const institution = yield* institutionRepo.findById(payload.institutionId)

					if (!Option.isSome(institution)) {
						return yield* Effect.fail(new NotFound({ message: "Institution not found" }))
					}

					const agreement = yield* goCardless.createAgreement(payload.institutionId, {
						maxHistoricalDays: institution.value.transactionTotalDays,
					})

					const referenceId = ReferenceId.make(FastCheck.sample(Arbitrary.make(Schema.UUID), 1)[0]!)

					const res = yield* goCardless.createLink({
						redirect: `http://localhost:8787/gocardless/callback/${referenceId}`,
						institutionId: payload.institutionId,
						agreementId: agreement.id,
						reference: referenceId,
						userLanguage: "EN",
					})

					yield* requisitionRepo.insert(
						Requisition.insert.make({
							id: res.id,
							referenceId: referenceId,
							institutionId: payload.institutionId,
							status: "created",
							deletedAt: null,
						}),
					)

					return CreateLinkResponse.make({ link: res.link })
				}).pipe(
					Effect.tapError((error) => Effect.logError(error)),
					// TODO: Remove later
					Effect.orDie,
					Effect.withSpan("GoCardless.getInstitutions"),
				),
			)
			.handle("callback", ({ path }) =>
				Effect.gen(function* () {
					const requisition = yield* requisitionRepo.findByReferenceId(path.id)

					if (Option.isNone(requisition)) {
						return yield* Effect.fail(new NotFound({ message: "Requisition not found" }))
					}

					const newRequisition = yield* goCardless.getRequistion(requisition.value.id)

					yield* Effect.forEach(newRequisition.accounts, (accountId) =>
						Effect.gen(function* () {
							const { account } = yield* goCardless
								.getAccount(accountId)
								.pipe(Effect.tapErrorTag("ResponseError", (e) => Effect.logError(e)))

							const { balances } = yield* goCardless.getBalances(accountId)

							yield* Effect.logInfo("balances", balances)

							const balance = balances[0]

							yield* accountRepo.insert(
								Account.insert.make({
									id: accountId,
									name: account.ownerName || "No name",
									// iban: account.iban,
									institutionId: requisition.value.institutionId,
									type: "depository",

									deletedAt: null,
									currency: account.currency || "",
									balanceAmount: +(balance?.balanceAmount.amount || 0),
									balanceCurrency: balance?.balanceAmount.currency || "",
								}),
							)
						}),
					)

					// TODO: Start Sync here

					yield* HttpApp.appendPreResponseHandler((_req, res) =>
						pipe(
							HttpServerResponse.setHeader(res, "Location", "http://localhost:3000"),
							HttpServerResponse.setStatus(302),
						),
					)
				}).pipe(
					Effect.tapError((error) => Effect.logError(error)),
					Effect.orDie,
				),
			)
			.handle("sync", ({ path }) =>
				Effect.gen(function* () {
					const account = yield* accountRepo.findById(path.accountId)

					if (Option.isNone(account)) {
						return yield* Effect.fail(new NotFound({ message: "Account not found" }))
					}

					const transactions = yield* goCardless.getTransactions(account.value.id)

					const mappedBookedTransactions = transactions.transactions.booked.map((v) =>
						transformTransaction(path.accountId, v, "posted"),
					)
					const mappedPendingTransactions = transactions.transactions.pending.map((v) =>
						transformTransaction(path.accountId, v, "pending"),
					)

					yield* transactionRepo.insertMultipleVoid([
						...mappedBookedTransactions,
						...mappedPendingTransactions,
					])

					return "Sucesfully started sync job"
				}).pipe(
					Effect.tapError((error) => Effect.logError(error)),
					Effect.orDie,
				),
			)
	}),
)
