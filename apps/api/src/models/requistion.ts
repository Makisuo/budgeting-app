import { Model } from "@effect/sql"
import { Schema } from "effect"
import { InstitutionId } from "./institution"
import { baseFields } from "./utils"

export const RequisitionId = Schema.String.pipe(Schema.brand("RequisitionId"))

export class Requisition extends Model.Class<Requisition>("Requisition")({
	id: RequisitionId,
	referenceId: Schema.String,

	institutionId: InstitutionId,

	status: Schema.Literal("created", "pending", "active"),

	...baseFields,
}) {}
