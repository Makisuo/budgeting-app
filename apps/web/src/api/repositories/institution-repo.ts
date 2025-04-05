import { Effect, Schema } from "effect"

import { Database, ModelRepository } from "@maple/api-utils"
import { Institution } from "@maple/api-utils/models"
import { schema } from "db"

export class InstitutionRepo extends Effect.Service<InstitutionRepo>()("InstitutionRepo", {
	effect: Effect.gen(function* () {
		const db = yield* Database.Database

		const baseRepository = yield* ModelRepository.makeRepository(schema.institutions, Institution.Model, {
			idColumn: "id",
		})

		const insertMultipleVoid = db.makeQueryWithSchema(Schema.Array(Institution.Model.insert), (execute, input) =>
			execute((client) =>
				client
					.insert(schema.institutions)
					.values(
						input.map((item) => ({
							...item,
							countries: item.countries as string[],
						})),
					)
					.onConflictDoNothing(),
			),
		)

		return { ...baseRepository, insertMultipleVoid } as const
	}),
	dependencies: [],
}) {}
