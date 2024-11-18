import { HttpApiBuilder } from "@effect/platform"
import { Config, Effect, Option } from "effect"
import { Api } from "~/api"
import { InternalError } from "~/errors"
import { GoCardlessService } from "~/services/gocardless/gocardless-service"
import { CreateLinkResponse } from "./models"

export const HttpGoCardlessLive = HttpApiBuilder.group(Api, "gocardless", (handlers) =>
	Effect.gen(function* () {
		const goCardless = yield* GoCardlessService

		return handlers.handle("createLink", ({ payload }) =>
			Effect.gen(function* () {
				const agreement = yield* goCardless.createAgreement(payload.institutionId)

				const res = yield* goCardless.createLink({
					redirect: "http://localhost:3000",
					institutionId: payload.institutionId,
					agreementId: agreement.id,
					userLanguage: "EN",
				})

				yield* Effect.logInfo(res)

				return CreateLinkResponse.make({ link: res.link })
			}).pipe(
				Effect.tapError((error) => Effect.logError(error)),
				Effect.catchTags({
					RequestError: (error) => new InternalError({ message: error.message }),
					ResponseError: (error) => {
						return new InternalError({ message: error.message })
					},
					ParseError: (error) => new InternalError({ message: error.message }),
				}),
				Effect.withSpan("GoCardless.getInstitutions"),
			),
		)
	}),
)
