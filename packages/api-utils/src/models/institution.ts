import { Model as M } from "@effect/sql"
import { DrizzleEffect } from "@maple/api-utils"
import { schema } from "db"
import { Schema } from "effect"

export const Id = Schema.String.pipe(Schema.brand("InstitutionId"))

export class Model extends M.Class<Model>("Institution")({
	...DrizzleEffect.createSelectSchema(schema.institutions).fields,
	id: Id,
}) {}
