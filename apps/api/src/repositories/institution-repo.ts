import { Effect, Schema } from "effect"

import { Model, SqlClient, SqlSchema } from "@effect/sql"
import { Institution } from "~/models/institution"
import { SqlLive } from "~/services/sql"

const TABLE_NAME = "institutions"
const SPAN_PREFIX = "InstitutionRepo"

export class InstitutionRepo extends Effect.Service<InstitutionRepo>()("InstitutionRepo", {
	effect: Effect.gen(function* () {
		const sql = yield* SqlClient.SqlClient

		const insertMultipleVoidSchema = SqlSchema.void({
			Request: Schema.Array(Institution.insert),
			// @ts-expect-error This is an effect type error, works though :)
			execute: (request) => sql`insert into ${sql(TABLE_NAME)} ${sql.insert(request)}`,
		})
		const insertMultipleVoid = (insert: (typeof Institution.insert.Type)[]) =>
			insertMultipleVoidSchema(insert).pipe(
				Effect.orDie,
				Effect.withSpan(`${SPAN_PREFIX}.insertMultipleVoid`, {
					captureStackTrace: false,
					attributes: { insert },
				}),
			)

		const baseRepository = yield* Model.makeRepository(Institution, {
			tableName: TABLE_NAME,
			spanPrefix: SPAN_PREFIX,
			idColumn: "id",
		})

		return { ...baseRepository, insertMultipleVoid } as const
	}),
	dependencies: [SqlLive],
}) {}
