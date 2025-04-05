import { schema } from "db"
import { Schema } from "effect"
import { DrizzleEffect } from "../services"

import { Model as M } from "@effect/sql"
import * as Auth from "./auth"
import * as Institution from "./institution"
import { baseFields } from "./utils"

export const Id = Schema.String.pipe(Schema.brand("AccountId"))

export class Model extends M.Class<Model>("Account")({
	...DrizzleEffect.createSelectSchema(schema.accounts).fields,
	id: M.GeneratedByApp(Id),
	tenantId: M.GeneratedByApp(Auth.TenantId),
	institutionId: Institution.Id,

	...baseFields,
}) {}

export const Insert = Model.insert
export const Update = Model.update
