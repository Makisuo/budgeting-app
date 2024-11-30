import { Model } from "@effect/sql"
import { Schema } from "effect"
import { baseFields } from "./utils"

export const InstitutionId = Schema.String.pipe(Schema.brand("InstitutionId"))

export class Institution extends Model.Class<Institution>("Institution")({
	id: Model.Generated(InstitutionId),
	name: Schema.String,
	logo: Schema.NullOr(Schema.String),

	provider: Schema.Literal("plaid", "gocardless"),

	...baseFields,
}) {}
