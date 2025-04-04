import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform"
import { Config, DateTime, Effect, Option, Schema, pipe } from "effect"
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

import {
	type Account,
	type Auth,
	Category,
	type InstitutionId,
	type Requisition,
	Transaction,
	TransactionId,
} from "@maple/api-utils/models"
import { InternalError } from "~/errors"
import { TransactionHelpers } from "../transaction"
import type * as GoCardlessSchema from "./models/models"
import { mapTransactionMethod } from "./transformer"

export class GoCardlessService extends Effect.Service<GoCardlessService>()("GoCardlessService", {
	effect: Effect.gen(function* () {
		const transactionHelpers = yield* TransactionHelpers

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

		const getRequistion = Effect.fn("getRequistion")(function* (id: typeof Requisition.Id.Type) {
			const { access } = yield* getAccessToken()

			return yield* HttpClientRequest.get(`/api/v2/requisitions/${id}/`).pipe(
				HttpClientRequest.prependUrl(baseUrl),
				HttpClientRequest.bearerToken(access),
				httpClient.execute,
				Effect.flatMap(HttpClientResponse.schemaBodyJson(GetRequisitionResponse, { errors: "all" })),
				Effect.scoped,
			)
		})

		const getAccount = Effect.fn("getAccount")(function* (id: typeof Account.Id.Type) {
			const { access } = yield* getAccessToken()

			return yield* HttpClientRequest.get(`/api/v2/accounts/${id}/details/`).pipe(
				HttpClientRequest.prependUrl(baseUrl),
				HttpClientRequest.bearerToken(access),
				httpClient.execute,
				Effect.flatMap(HttpClientResponse.schemaBodyJson(GetAccountDetailsResponse, { errors: "all" })),
				Effect.scoped,
			)
		})

		const getBalances = Effect.fn("getBalances")(function* (accountId: typeof Account.Id.Type) {
			const { access } = yield* getAccessToken()

			return yield* HttpClientRequest.get(`/api/v2/accounts/${accountId}/balances/`).pipe(
				HttpClientRequest.prependUrl(baseUrl),
				HttpClientRequest.bearerToken(access),
				httpClient.execute,
				Effect.flatMap(HttpClientResponse.schemaBodyJson(GetBalancesResponse, { errors: "all" })),
				Effect.scoped,
			)
		})

		const getTransactions = Effect.fn("getTransactions")(function* (accountId: typeof Account.Id.Type) {
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

		const transformTransaction = Effect.fn("transformTransaction")(function* (
			accountId: typeof Account.Id.Type,
			tenantId: typeof Auth.TenantId.Type,
			transaction: GoCardlessSchema.Transaction,
			status: "posted" | "pending",
		) {
			const date = DateTime.unsafeFromDate(transaction.bookingDateTime ?? transaction.bookingDate)

			const transactionId = transaction.transactionId || transaction.internalTransactionId

			if (!transactionId) {
				return yield* new InternalError({
					message: "Transaction id is missing from GoCardless response",
				})
			}

			const company = yield* Effect.if(!!transaction.debtorName, {
				onTrue: () =>
					pipe(
						transactionHelpers.detectCompany(transaction.debtorName!),
						Effect.flatMap(
							Option.match({
								onNone: () => Effect.succeed(null),
								onSome: Effect.succeed,
							}),
						),
					),

				onFalse: () => Effect.succeed(null),
			})

			return Transaction.insert.make({
				id: TransactionId.make(transactionId),
				accountId,
				tenantId,
				amount: +transaction.transactionAmount.amount,
				currency: transaction.transactionAmount.currency,

				directTransfer: null,

				name:
					transaction.creditorName ||
					transaction.debtorName ||
					transaction.remittanceInformationUnstructuredArray?.at(0) ||
					transaction.proprietaryBankTransactionCode ||
					"No Info",
				description: transaction.remittanceInformationUnstructuredArray?.join(", ") || "No Info",

				companyId: company?.id || null,

				// @ts-expect-error
				debtorIban: transaction.debtorAccount?.iban || null,
				// @ts-expect-error
				creditorIban: transaction.creditorAccount?.iban || null,

				status: status,
				balance: null,
				categoryId: company?.categoryId || Category.Id.make("uncategorized"),
				currencyRate: null,
				currencySource: null,
				date: date,
				method: mapTransactionMethod(transaction.proprietaryBankTransactionCode || undefined),

				deletedAt: null,
				updatedAt: new Date(),
			})
		})

		return {
			getRequistion,
			getAccount,
			getBalances,
			getTransactions,
			getInstitutions,
			createAgreement,
			createLink,
			transformTransaction,
		} as const
	}),

	dependencies: [TransactionHelpers.Default, FetchHttpClient.layer],
}) {}
