import { Effect, Schema } from "effect"

import { Model, SqlClient, SqlSchema } from "@effect/sql"
import { Requisition } from "~/models/requistion"
import { SqlLive } from "~/services/sql"

const TABLE_NAME = "requisitions"
const SPAN_PREFIX = "RequisitionRepo"

export class RequisitionRepo extends Effect.Service<RequisitionRepo>()("RequisitionRepo", {
	effect: Effect.gen(function* () {
		const sql = yield* SqlClient.SqlClient

		const baseRepository = yield* Model.makeRepository(Requisition, {
			tableName: TABLE_NAME,
			spanPrefix: SPAN_PREFIX,
			idColumn: "id",
		})

		const findByReferenceIdSchema = SqlSchema.findOne({
			Request: Schema.String,
			Result: Requisition,
			execute: (id) => sql`SELECT * FROM ${sql(TABLE_NAME)} WHERE reference_id = ${id}`,
		})

		const findByReferenceId = (id: string) =>
			findByReferenceIdSchema(id).pipe(
				Effect.tapErrorTag("ParseError", (e) => Effect.logInfo(e)),
				Effect.orDie,
				Effect.withSpan(`${SPAN_PREFIX}.findByReferenceId`, {
					captureStackTrace: false,
					attributes: { id },
				}),
			)

		return { ...baseRepository, findByReferenceId } as const
	}),
	dependencies: [SqlLive],
}) {}
