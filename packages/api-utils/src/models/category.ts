import { Model as M } from "@effect/sql"

import { schema } from "db"
import { Schema } from "effect"
import { DrizzleEffect } from "../services"

export const Id = Schema.String.pipe(Schema.brand("CategoryId"))

export class Model extends M.Class<Model>("Category")({
	...DrizzleEffect.createSelectSchema(schema.categories).fields,
	id: Schema.String,
}) {}
