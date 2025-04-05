import { Model as M } from "@effect/sql"
import { schema } from "db"
import { Schema } from "effect"
import { DrizzleEffect } from "../services"
import { TenantId } from "./auth"
import * as Institution from "./institution"
import { baseFields } from "./utils"

export const Id = Schema.String.pipe(Schema.brand("@GoCardless/RequisitionId"))

export const ReferenceId = Schema.UUID.pipe(Schema.brand("@GoCardless/ReferenceId"))

export class Model extends M.Class<Model>("Requisition")({
	...DrizzleEffect.createSelectSchema(schema.requisitions).fields,

	id: Id,
	referenceId: ReferenceId,

	institutionId: Institution.Id,
	tenantId: M.GeneratedByApp(TenantId),

	...baseFields,
}) {}

export const Insert = Model.insert
export const Update = Model.update
