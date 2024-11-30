import { Effect } from "effect"

import { Model, SqlClient } from "@effect/sql"
import { Institution } from "~/models/institution"
import { SqlLive } from "~/services/sql"

const TABLE_NAME = "institutions"
const SPAN_PREFIX = "InstitutionRepo"

export class InstitutionRepo extends Effect.Service<InstitutionRepo>()("InstitutionRepo", {
	effect: Effect.gen(function* () {
		const sql = yield* SqlClient.SqlClient

		const baseRepository = yield* Model.makeRepository(Institution, {
			tableName: TABLE_NAME,
			spanPrefix: SPAN_PREFIX,
			idColumn: "id",
		})

		return { ...baseRepository } as const
	}),
	dependencies: [SqlLive],
}) {}
