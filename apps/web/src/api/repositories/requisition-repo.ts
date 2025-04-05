import { Effect, Option } from "effect"

import { Database, ModelRepository } from "@maple/api-utils"
import { Requisition } from "@maple/api-utils/models"
import { schema } from "db"

export class RequisitionRepo extends Effect.Service<RequisitionRepo>()("RequisitionRepo", {
	effect: Effect.gen(function* () {
		const db = yield* Database.Database

		const baseRepository = yield* ModelRepository.makeRepository(schema.requisitions, Requisition.Model, {
			idColumn: "id",
		})

		const findByReferenceId = db.makeQuery((execute, input: typeof Requisition.ReferenceId.Type) =>
			execute((client) =>
				client.query.requisitions.findFirst({ where: (table, { eq }) => eq(table.referenceId, input) }),
			).pipe(Effect.map(Option.fromNullable)),
		)

		return { ...baseRepository, findByReferenceId } as const
	}),
	dependencies: [],
	// accessors: true,
}) {}
