import { Effect, Option, Schema } from "effect"

import { Database } from "@maple/api-utils"
import { type Institution, InstitutionInsert } from "@maple/api-utils/models"
import { schema } from "db"

export class InstitutionRepo extends Effect.Service<InstitutionRepo>()("InstitutionRepo", {
	effect: Effect.gen(function* () {
		const db = yield* Database.Database

		const insertMultipleVoid = db.makeQueryWithSchema(Schema.Array(InstitutionInsert), (execute, input) =>
			execute((client) => client.insert(schema.institutions).values([...input])),
		)

		const findById = db.makeQuery((execute, input: Institution["id"]) =>
			execute((client) =>
				client.query.institutions.findFirst({ where: (table, { eq }) => eq(table.id, input) }),
			).pipe(Effect.map(Option.fromNullable)),
		)

		return { findById, insertMultipleVoid } as const
	}),
	dependencies: [],
}) {}
