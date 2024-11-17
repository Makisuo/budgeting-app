import { HttpApiBuilder } from "@effect/platform"
import { PgDrizzle } from "@effect/sql-drizzle/Pg"
import { schema } from "db"
import { Effect, Option } from "effect"
import { Api } from "~/api"
import { InternalError } from "~/errors"
import { GoCardlessService } from "~/services/gocardless/gocardless-service"

export const HttpAdminLive = HttpApiBuilder.group(Api, "admin", (handlers) =>
	Effect.gen(function* () {
		const goCardless = yield* GoCardlessService

		return handlers.handle("syncInstitutions", () =>
			Effect.gen(function* () {
				const db = yield* PgDrizzle
				yield* Effect.log("Hello2")

				const institutions = yield* goCardless.getInstitutions(Option.none())

				// @ts-expect-error Effect Schema returns a readonly array which is not compatible with drizzle
				yield* db.insert(schema.institution).values(institutions)

				return institutions
			}).pipe(
				Effect.tapError((error) => Effect.logError(error)),
				Effect.catchTags({
					RequestError: (error) => new InternalError({ message: error.message }),
					ResponseError: (error) => new InternalError({ message: error.message }),
					ParseError: (error) => new InternalError({ message: error.message }),
					SqlError: (error) => new InternalError({ message: error.message }),
				}),
				Effect.withSpan("GoCardless.getInstitutions"),
			),
		)
	}),
)
