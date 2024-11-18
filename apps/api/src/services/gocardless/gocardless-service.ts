import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform"
import { Config, Effect, Option, Schedule, Schema } from "effect"
import {
	CreateAgreementResponse,
	CreateLinkResponse,
	GetRequisitionResponse,
	Institution,
	NewTokenResponse,
} from "./models"

export class GoCardlessService extends Effect.Service<GoCardlessService>()("GoCardlessService", {
	effect: Effect.gen(function* () {
		const baseUrl = "https://bankaccountdata.gocardless.com"

		const secretId = yield* Config.string("GO_CARDLESS_SECRET_ID")
		const secretKey = yield* Config.string("GO_CARDLESS_SECRET_KEY")

		const defaultClient = yield* HttpClient.HttpClient
		const httpClient = defaultClient.pipe(
			HttpClient.filterStatusOk,
			HttpClient.retry({ times: 3, schedule: Schedule.exponential("300 millis") }),
		)

		// TODO: Should be saved in KV and then refreshed
		const getAccessToken = () =>
			Effect.gen(function* () {
				const response = yield* HttpClientRequest.post("/api/v2/token/new/").pipe(
					HttpClientRequest.prependUrl(baseUrl),
					HttpClientRequest.bodyUnsafeJson({
						secret_id: secretId,
						secret_key: secretKey,
					}),

					httpClient.execute,
					Effect.flatMap(HttpClientResponse.schemaBodyJson(NewTokenResponse, { errors: "all" })),
					Effect.scoped,
				)

				return response
			})

		return {
			getRequistion: (id: string) =>
				Effect.gen(function* () {
					const { access } = yield* getAccessToken()

					return yield* HttpClientRequest.get(`/api/v2/requisitions/${id}/`).pipe(
						HttpClientRequest.prependUrl(baseUrl),
						HttpClientRequest.bearerToken(access),
						httpClient.execute,
						Effect.flatMap(HttpClientResponse.schemaBodyJson(GetRequisitionResponse, { errors: "all" })),
						Effect.scoped,
					)
				}),
			getInstitutions: (countryCode: Option.Option<string>) =>
				Effect.gen(function* () {
					const { access } = yield* getAccessToken()

					const appendUrlParams = Option.match(countryCode, {
						onSome: (countryCode) => HttpClientRequest.appendUrlParam("country", countryCode),
						onNone: () => (self: HttpClientRequest.HttpClientRequest) => self,
					})

					return yield* HttpClientRequest.get("/api/v2/institutions/").pipe(
						HttpClientRequest.prependUrl(baseUrl),
						appendUrlParams,
						HttpClientRequest.bearerToken(access),
						httpClient.execute,
						Effect.flatMap(HttpClientResponse.schemaBodyJson(Schema.Array(Institution), { errors: "all" })),
						Effect.scoped,
					)
				}),
			createAgreement: (
				institutionId: string,
				options?: {
					maxHistoricalDays?: number
					maxTransactionDays?: number
					accessValidForDays?: number
					accessScope?: string[]
				},
			) =>
				Effect.gen(function* () {
					const { access } = yield* getAccessToken()

					return yield* HttpClientRequest.post("/api/v2/agreements/enduser/").pipe(
						HttpClientRequest.prependUrl(baseUrl),
						HttpClientRequest.bearerToken(access),
						HttpClientRequest.bodyUnsafeJson({
							institution_id: institutionId,
							max_historical_days: options?.maxHistoricalDays || 365,
							access_valid_for_days: options?.accessValidForDays || 180,
							access_scope: options?.accessScope || ["balances", "details", "transactions"],
						}),
						httpClient.execute,
						Effect.flatMap(HttpClientResponse.schemaBodyJson(CreateAgreementResponse, { errors: "all" })),
						Effect.scoped,
					)
				}),
			createLink: (options: {
				redirect: string
				// TODO: Should be a branded ID
				institutionId: string
				reference?: string
				// TODO: Should be a branded ID
				agreementId?: string
				userLanguage: string | undefined
			}) =>
				Effect.gen(function* () {
					const { access } = yield* getAccessToken()

					return yield* HttpClientRequest.post("/api/v2/requisitions/").pipe(
						HttpClientRequest.prependUrl(baseUrl),
						HttpClientRequest.bearerToken(access),
						HttpClientRequest.bodyUnsafeJson({
							redirect: options.redirect,
							institution_id: options.institutionId,
							reference: options.reference,
							agreement: options.agreementId,
							user_language: options.userLanguage || "EN",
						}),
						httpClient.execute,
						Effect.flatMap(HttpClientResponse.schemaBodyJson(CreateLinkResponse, { errors: "all" })),
						Effect.scoped,
					)
				}),
		}
	}).pipe(Effect.provide(FetchHttpClient.layer)),
}) {}
