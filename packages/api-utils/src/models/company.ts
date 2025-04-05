import { Model as M } from "@effect/sql"

import { schema } from "db"
import { Schema } from "effect"
import { DrizzleEffect } from "../services"
import * as Category from "./category"

export const Id = Schema.String.pipe(Schema.brand("CompanyId"))

export class Model extends M.Class<Model>("Company")({
	...DrizzleEffect.createSelectSchema(schema.companies).fields,
	id: M.Generated(Id),

	categoryId: Category.Id,
}) {}
