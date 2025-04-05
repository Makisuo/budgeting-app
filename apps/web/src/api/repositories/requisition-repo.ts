import { Effect, Option } from "effect"

import { Database } from "@maple/api-utils"
import type { Requisition } from "@maple/api-utils/models"
import { schema } from "db"
import { eq } from "drizzle-orm"

export class RequisitionRepo extends Effect.Service<RequisitionRepo>()("RequisitionRepo", {
	effect: Effect.gen(function* () {
		const db = yield* Database.Database

		const findById = db.makeQuery((execute, input: typeof Requisition.Id.Type) =>
			execute((client) =>
				client.query.requisitions.findFirst({ where: (table, { eq }) => eq(table.id, input) }),
			).pipe(Effect.map(Option.fromNullable)),
		)

		const update = db.makeQuery(
			(execute, input: { id: typeof Requisition.Id.Type; data: typeof Requisition.Update.Type }) =>
				execute((client) =>
					client
						.update(schema.requisitions)
						.set(input.data)
						.where(eq(schema.requisitions.id, input.id))
						.returning(),
				).pipe(Effect.map((value) => value[0]!)),
		)

		const updateVoid = db.makeQuery(
			(execute, input: { id: typeof Requisition.Id.Type; data: typeof Requisition.Update.Type }) =>
				execute((client) =>
					client.update(schema.requisitions).set(input.data).where(eq(schema.requisitions.id, input.id)),
				),
		)

		const insert = db.makeQuery((execute, input: typeof Requisition.Insert.Type) =>
			execute((client) => client.insert(schema.requisitions).values([input]).returning()),
		)

		const insertVoid = db.makeQuery((execute, input: typeof Requisition.Model.insert.Type) =>
			execute((client) => client.insert(schema.requisitions).values([input])),
		)

		// Advanced query

		const findByReferenceId = db.makeQuery((execute, input: typeof Requisition.ReferenceId.Type) =>
			execute((client) =>
				client.query.requisitions.findFirst({ where: (table, { eq }) => eq(table.referenceId, input) }),
			).pipe(Effect.map(Option.fromNullable)),
		)

		return { findById, update, updateVoid, insert, insertVoid, findByReferenceId } as const
	}),
	dependencies: [],
	// accessors: true,
}) {}
