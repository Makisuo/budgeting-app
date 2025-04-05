import { Effect, Option } from "effect"

import { Database, ModelRepository } from "@maple/api-utils"
import { Company } from "@maple/api-utils/models"
import { schema } from "db"

export class CompanyRepo extends Effect.Service<CompanyRepo>()("CompanyRepo", {
	effect: Effect.gen(function* () {
		const db = yield* Database.Database

		const baseRepository = yield* ModelRepository.makeRepository(schema.companies, Company.Model, {
			idColumn: "id",
		})

		const findByPattern = db.makeQuery((execute, pattern: string) =>
			execute((client) =>
				client.query.companies.findFirst({
					where: (table, { sql, exists }) =>
						exists(sql`SELECT 1 FROM jsonb_array_elements_text(patterns) AS pattern
				WHERE ${pattern} ~~* ${table.patterns}`),
				}),
			).pipe(Effect.map((results) => Option.fromNullable(results))),
		)

		return { ...baseRepository, findByPattern } as const
	}),
	dependencies: [],
}) {}
