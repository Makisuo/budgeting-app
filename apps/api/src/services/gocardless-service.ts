import { HttpClientRequest } from "@effect/platform"
import { Effect } from "effect"

export class GoCardlessService extends Effect.Service<GoCardlessService>()("GoCardlessService", {
	effect: Effect.gen(function* () {
		const baseUrl = "https://bankaccountdata.gocardless.com"
		const accessToken = yield* Effect.succeed("WOW")

		return {
			getInstituions: (countryCode: string) =>
				HttpClientRequest.get("/api/v2/institutions/").pipe(
					HttpClientRequest.prependUrl(baseUrl),
					HttpClientRequest.appendUrlParam("country", countryCode),
					HttpClientRequest.bearerToken(accessToken),
				),
		}
	}),
}) {}
