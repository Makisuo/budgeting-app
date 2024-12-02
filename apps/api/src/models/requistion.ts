import { Model } from "@effect/sql"
import { Schema } from "effect"
import { InstitutionId } from "./institution"
import { baseFields } from "./utils"

export const RequisitionId = Schema.String.pipe(Schema.brand("@GoCardless/RequisitionId"))

export const ReferenceId = Schema.UUID.pipe(Schema.brand("@GoCardless/ReferenceId"))

export class Requisition extends Model.Class<Requisition>("Requisition")({
	id: RequisitionId,
	referenceId: ReferenceId,

	institutionId: InstitutionId,

	status: Schema.Literal("created", "pending", "active"),

	...baseFields,
}) {}
