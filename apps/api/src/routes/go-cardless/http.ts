import { HttpApiBuilder, HttpApp, HttpServerResponse } from "@effect/platform"
import { PgDrizzle } from "@effect/sql-drizzle/Pg"
import { eq, schema } from "db"
import { Arbitrary, Config, Effect, FastCheck, Schema, pipe } from "effect"
import { AccountType } from "plaid"
import { Api } from "~/api"
import { InternalError, NotFound } from "~/errors"
import { Workflows } from "~/services/cloudflare/workflows"
import { GoCardlessService } from "~/services/gocardless/gocardless-service"
import { CreateLinkResponse } from "./models"

export const HttpGoCardlessLive = HttpApiBuilder.group(Api, "gocardless", (handlers) =>
	Effect.gen(function* () {
		const goCardless = yield* GoCardlessService

		const workflows = yield* Workflows
		const syncWorkflow = workflows.getWorkflow<WorkflowsBinding>("SyncAccountWorkflow")

		return handlers
			.handle("createLink", ({ payload }) =>
				Effect.gen(function* () {
					const db = yield* PgDrizzle

					const institution = (yield* db
						.select()
						.from(schema.institution)
						.where(eq(schema.institution.id, payload.institutionId)))[0]

					if (!institution) {
						return yield* Effect.fail(new NotFound({ message: "Institution not found" }))
					}

					const agreement = yield* goCardless.createAgreement(payload.institutionId, {
						maxHistoricalDays: institution.transaction_total_days,
					})

					const referenceId = FastCheck.sample(Arbitrary.make(Schema.UUID), 1)[0]!

					const res = yield* goCardless.createLink({
						redirect: `http://localhost:8787/gocardless/callback/${referenceId}`,
						institutionId: payload.institutionId,
						agreementId: agreement.id,
						reference: referenceId,
						userLanguage: "EN",
					})

					yield* db.insert(schema.requisition).values({
						id: res.id,
						institution_id: payload.institutionId,
						reference_id: referenceId,
						status: "created",
					})

					return CreateLinkResponse.make({ link: res.link })
				}).pipe(
					Effect.tapError((error) => Effect.logError(error)),
					Effect.catchTags({
						RequestError: (error) => new InternalError({ message: error.message }),
						ResponseError: (error) => {
							return new InternalError({ message: error.message })
						},
						SqlError: (error) => new InternalError({ message: error.message }),
						ParseError: (error) => new InternalError({ message: error.message }),
					}),
					Effect.withSpan("GoCardless.getInstitutions"),
				),
			)
			.handle("callback", ({ path }) =>
				Effect.gen(function* () {
					const db = yield* PgDrizzle

					const requisition = (yield* db
						.select()
						.from(schema.requisition)
						.where(eq(schema.requisition.reference_id, path.id)))[0]

					if (!requisition) {
						return yield* Effect.fail(new NotFound({ message: "Requisition not found" }))
					}

					const newRequisition = yield* goCardless.getRequistion(requisition.id)

					yield* Effect.forEach(newRequisition.accounts, (accountId) =>
						Effect.gen(function* () {
							const { account } = yield* goCardless.getAccount(accountId)

							yield* db.insert(schema.bankAccount).values({
								id: accountId,
								name: account.ownerName,
								requistionId: requisition.id,
								iban: account.iban,
								type: AccountType.Other,
							})
						}),
					)

					yield* syncWorkflow.create({ params: { requisitionId: requisition.id } })

					yield* HttpApp.appendPreResponseHandler((_req, res) =>
						pipe(
							HttpServerResponse.setHeader(res, "Location", "http://localhost:3000"),
							HttpServerResponse.setStatus(302),
						),
					)
				}).pipe(
					Effect.tapError((error) => Effect.logError(error)),
					Effect.catchTags({
						SqlError: (error) => new InternalError({ message: error.message }),
						ParseError: (error) => new InternalError({ message: error.message }),
						RequestError: (error) => new InternalError({ message: error.message }),
						ResponseError: (error) => {
							return new InternalError({ message: error.message })
						},
					}),
				),
			)
			.handle("sync", ({ path }) =>
				Effect.gen(function* () {
					const db = yield* PgDrizzle

					const requisition = (yield* db
						.select()
						.from(schema.requisition)
						.where(eq(schema.requisition.reference_id, path.referenceId)))[0]

					if (!requisition) {
						return yield* Effect.fail(new NotFound({ message: "Requisition not found" }))
					}

					yield* syncWorkflow.create({ params: { requisitionId: requisition.id } })

					return "Sucesfully started sync job"
				}).pipe(
					Effect.tapError((error) => Effect.logError(error)),
					Effect.catchTags({
						ParseError: (error) => new InternalError({ message: error.message }),
						SqlError: (error) => new InternalError({ message: error.message }),
					}),
				),
			)
	}),
)
