import { Effect, Option, Schema } from "effect"

import { Model, SqlClient, SqlSchema } from "@effect/sql"
import type { Institution, InstitutionInsert } from "~/models/institution"
import { SqlLive } from "~/services/sql"

const TABLE_NAME = "institutions"
const SPAN_PREFIX = "InstitutionRepo"

import { Database } from "@maple/api-utils"
import { schema } from "db"

export class InstitutionRepo extends Effect.Service<InstitutionRepo>()("InstitutionRepo", {
	effect: Effect.gen(function* () {
		const db = yield* Database.Database

		const insertMultipleVoid = db.makeQuery((execute, input: (typeof InstitutionInsert.Type)[]) =>
			execute((client) => client.insert(schema.institutions).values(input)).pipe(Effect.map(Option.fromNullable)),
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
