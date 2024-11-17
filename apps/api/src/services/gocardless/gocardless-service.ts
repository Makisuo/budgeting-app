import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform"
import { Config, Effect, Option, Schedule, Schema } from "effect"
import { Institution, NewTokenResponse } from "./models"

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
		}
	}).pipe(Effect.provide(FetchHttpClient.layer)),
}) {}
