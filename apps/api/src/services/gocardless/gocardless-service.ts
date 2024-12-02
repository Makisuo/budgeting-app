import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform"
import { Config, Effect, Option, Schedule, Schema } from "effect"
import {
	type AgreementId,
	CreateAgreementResponse,
	CreateLinkResponse,
	GetAccountDetailsResponse,
	GetBalancesResponse,
	GetRequisitionResponse,
	GetTransactionsResponse,
	Institution,
	NewTokenResponse,
} from "./models/models"

import type { AccountId } from "~/models/account"
import type { InstitutionId } from "~/models/institution"
import type { RequisitionId } from "~/models/requistion"

export class GoCardlessService extends Effect.Service<GoCardlessService>()("GoCardlessService", {
	effect: Effect.gen(function* () {
		const baseUrl = "https://bankaccountdata.gocardless.com"

		const secretId = yield* Config.string("GO_CARDLESS_SECRET_ID")
		const secretKey = yield* Config.string("GO_CARDLESS_SECRET_KEY")

		const defaultClient = yield* HttpClient.HttpClient
		const httpClient = defaultClient.pipe(
			HttpClient.filterStatusOk,
			// HttpClient.retry({ times: 3, schedule: Schedule.exponential("300 millis") }),
		)

		// TODO: Should be saved in KV and then refreshed
		const getAccessToken = Effect.fn("getAccessToken")(function* () {
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

		const getRequistion = Effect.fn("getRequistion")(function* (id: typeof RequisitionId.Type) {
			const { access } = yield* getAccessToken()

			return yield* HttpClientRequest.get(`/api/v2/requisitions/${id}/`).pipe(
				HttpClientRequest.prependUrl(baseUrl),
				HttpClientRequest.bearerToken(access),
				httpClient.execute,
				Effect.flatMap(HttpClientResponse.schemaBodyJson(GetRequisitionResponse, { errors: "all" })),
				Effect.scoped,
			)
		})

		const getAccount = Effect.fn("getAccount")(function* (id: typeof AccountId.Type) {
			const { access } = yield* getAccessToken()

			return yield* HttpClientRequest.get(`/api/v2/accounts/${id}/details/`).pipe(
				HttpClientRequest.prependUrl(baseUrl),
				HttpClientRequest.bearerToken(access),
				httpClient.execute,
				Effect.flatMap(HttpClientResponse.schemaBodyJson(GetAccountDetailsResponse, { errors: "all" })),
				Effect.scoped,
			)
		})

		const getBalances = Effect.fn("getBalances")(function* (accountId: typeof AccountId.Type) {
			const { access } = yield* getAccessToken()

			return yield* HttpClientRequest.get(`/api/v2/accounts/${accountId}/balances/`).pipe(
				HttpClientRequest.prependUrl(baseUrl),
				HttpClientRequest.bearerToken(access),
				httpClient.execute,
				Effect.flatMap(HttpClientResponse.schemaBodyJson(GetBalancesResponse, { errors: "all" })),
				Effect.scoped,
			)
		})

		const getTransactions = Effect.fn("getTransactions")(function* (accountId: typeof AccountId.Type) {
			const { access } = yield* getAccessToken()

			return yield* HttpClientRequest.get(`/api/v2/accounts/${accountId}/transactions/`).pipe(
				HttpClientRequest.prependUrl(baseUrl),
				HttpClientRequest.bearerToken(access),
				httpClient.execute,
				Effect.flatMap(HttpClientResponse.schemaBodyJson(GetTransactionsResponse, { errors: "all" })),
				Effect.scoped,
			)
		})

		const getInstitutions = Effect.fn("getInstitutions")(function* (countryCode: Option.Option<string>) {
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
		})

		const createAgreement = Effect.fn("createAgreement")(function* (
			institutionId: string,
			options?: {
				maxHistoricalDays?: number
				maxTransactionDays?: number
				accessValidForDays?: number
				accessScope?: string[]
			},
		) {
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
		})

		const createLink = Effect.fn("createLink")(function* (options: {
			redirect: string
			institutionId: typeof InstitutionId.Type
			reference?: string
			agreementId?: AgreementId
			userLanguage: string | undefined
		}) {
			const { access } = yield* getAccessToken()

			yield* Effect.logInfo("Creating link", access)

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
		})

		return {
			getRequistion,
			getAccount,
			getBalances,
			getTransactions,
			getInstitutions,
			createAgreement,
			createLink,
		} as const
	}).pipe(Effect.provide(FetchHttpClient.layer)),
}) {}
