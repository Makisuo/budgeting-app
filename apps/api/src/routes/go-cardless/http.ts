import { HttpApiBuilder } from "@effect/platform"
import { Config, Effect, Option } from "effect"
import { Api } from "~/api"
import { InternalError } from "~/errors"
import { GoCardlessService } from "~/services/gocardless/gocardless-service"

export const HttpGoCardlessLive = HttpApiBuilder.group(Api, "gocardless", (handlers) =>
	Effect.gen(function* () {
		const goCardless = yield* GoCardlessService

		return handlers.handle("getInstitutions", ({ path }) =>
			Effect.gen(function* () {
				const res = yield* goCardless.getInstitutions(Option.some(path.countryCode))

				return res
			}).pipe(
				Effect.tapError((error) => Effect.logError(error)),
				Effect.catchTags({
					RequestError: (error) => new InternalError({ message: error.message }),
					ResponseError: (error) => new InternalError({ message: error.message }),
					ParseError: (error) => new InternalError({ message: error.message }),
				}),
				Effect.withSpan("GoCardless.getInstitutions"),
			),
		)
	}),
)
