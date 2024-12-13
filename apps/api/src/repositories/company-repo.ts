import { Effect, Schema } from "effect"

import { Model, SqlClient, SqlSchema } from "@effect/sql"
import { Company } from "~/models/company"
import { SqlLive } from "~/services/sql"

const TABLE_NAME = "companies"
const SPAN_PREFIX = "CompanyRepo"

export class CompanyRepo extends Effect.Service<CompanyRepo>()("CompanyRepo", {
	effect: Effect.gen(function* () {
		const sql = yield* SqlClient.SqlClient

		const baseRepository = yield* Model.makeRepository(Company, {
			tableName: TABLE_NAME,
			spanPrefix: SPAN_PREFIX,
			idColumn: "id",
		})

		const findByPattern = SqlSchema.findOne({
			Request: Schema.String,
			Result: Company,
			execute: (request) => sql`SELECT * FROM ${sql(TABLE_NAME)}
			WHERE EXISTS (
				SELECT 1 FROM jsonb_array_elements_text(patterns) AS pattern
				WHERE ${request} ILIKE pattern || '%' 
			)`,
		})

		return { ...baseRepository, findByPattern } as const
	}),
	dependencies: [SqlLive],
}) {}
