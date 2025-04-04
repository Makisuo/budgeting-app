import { HttpApiBuilder, HttpApp, HttpServerResponse } from "@effect/platform"
import { Account, ReferenceId, Requisition } from "@maple/api-utils/models"
import { Arbitrary, Config, Effect, FastCheck, Option, Schema, pipe } from "effect"
import { Api } from "~/api"
import { Authorization } from "~/authorization"
import { NotFound } from "~/errors"
import { AccountRepo } from "~/repositories/account-repo"
import { InstitutionRepo } from "~/repositories/institution-repo"
import { RequisitionRepo } from "~/repositories/requisition-repo"
import { Workflows } from "~/services/cloudflare/workflows"
import { GoCardlessService } from "~/services/gocardless/gocardless-service"
import { CreateLinkResponse } from "./models"

export const HttpGoCardlessLive = HttpApiBuilder.group(Api, "gocardless", (handlers) =>
	Effect.gen(function* () {
		const goCardless = yield* GoCardlessService

		const institutionRepo = yield* InstitutionRepo
		const requisitionRepo = yield* RequisitionRepo
		const accountRepo = yield* AccountRepo

		const workflow = yield* Workflows
		const syncTransactionWorkflow = workflow.getWorkflow<WorkflowsBinding>("SyncTransactionsWorkflow")

		return handlers
			.handle("createLink", ({ payload }) =>
				Effect.gen(function* () {
					const currentUser = yield* Authorization.provides

					const apiBaseUrl = yield* Config.string("API_BASE_URL")

					const institution = yield* institutionRepo
						.findById(payload.institutionId)
						.pipe(Effect.map(Option.getOrNull))

					if (!institution) {
						return yield* Effect.fail(new NotFound({ message: "Institution not found" }))
					}

					const agreement = yield* goCardless.createAgreement(payload.institutionId, {
						maxHistoricalDays: institution.transactionTotalDays,
					})

					const referenceId = ReferenceId.make(FastCheck.sample(Arbitrary.make(Schema.UUID), 1)[0]!)

					const res = yield* goCardless.createLink({
						redirect: `${apiBaseUrl}/gocardless/callback/${referenceId}`,
						institutionId: payload.institutionId,
						agreementId: agreement.id,
						reference: referenceId,
						userLanguage: "EN",
					})

					yield* requisitionRepo.insert(
						Requisition.insert.make({
							id: res.id,
							referenceId: referenceId,
							tenantId: currentUser.tenantId,
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

					const appBaseUrl = yield* Config.string("APP_BASE_URL")

					if (Option.isNone(requisition)) {
						return yield* Effect.fail(new NotFound({ message: "Requisition not found" }))
					}

					const newRequisition = yield* goCardless.getRequistion(requisition.value.id)

					yield* Effect.forEach(newRequisition.accounts, (accountId) =>
						Effect.gen(function* () {
							const { account } = yield* goCardless
								.getAccount(accountId)
								.pipe(Effect.tapErrorTag("ResponseError", (e) => Effect.logError(e)))

							yield* accountRepo.insert(
								Account.insert.make({
									id: accountId,
									name: account.ownerName || "No name",
									iban: account.iban || null,
									institutionId: requisition.value.institutionId,
									tenantId: requisition.value.tenantId,

									type: "depository",

									deletedAt: null,
									currency: account.currency || "",
									lastSync: null,
									balanceAmount: 0,
									balanceCurrency: "USD",
								}),
							)

							yield* syncTransactionWorkflow.create({ params: { accountId } })
						}),
					)

					yield* HttpApp.appendPreResponseHandler((_req, res) =>
						pipe(
							HttpServerResponse.setHeader(res, "Location", appBaseUrl),
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

					yield* syncTransactionWorkflow.create({ params: { accountId: path.accountId } })

					return "Sucesfully started sync job"
				}).pipe(
					Effect.tapError((error) => Effect.logError(error)),
					Effect.orDie,
				),
			)
	}),
)
