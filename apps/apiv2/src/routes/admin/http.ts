import { HttpApiBuilder } from "@effect/platform"
import { Effect, Option } from "effect"
import { Api } from "~/api"
import { Institution } from "~/models/institution"
import { InstitutionRepo } from "~/repositories/institution-repo"
import { GoCardlessService } from "~/services/gocardless/gocardless-service"

export const HttpAdminLive = HttpApiBuilder.group(Api, "admin", (handlers) =>
	Effect.gen(function* () {
		const goCardless = yield* GoCardlessService
		const institiutionRepo = yield* InstitutionRepo

		return handlers.handle("syncInstitutions", () =>
			Effect.gen(function* () {
				const institutions = yield* goCardless.getInstitutions(Option.none())

				yield* Effect.forEach(institutions, (institution) =>
					Effect.gen(function* () {
						const dbInstitutions = Institution.insert.make({
							id: institution.id,
							name: institution.name,
							transactionTotalDays: institution.transaction_total_days,
							logo: institution.logo,
							provider: "gocardless",
							deletedAt: null,
						})

						yield* institiutionRepo.insert(dbInstitutions).pipe(Effect.tapError(Effect.logError))
					}),
				)

				return institutions
			}).pipe(
				Effect.tapError((error) => Effect.logError(error)),
				Effect.orDie,
				Effect.withSpan("GoCardless.getInstitutions"),
			),
		)
	}),
)
