import { DrizzleEffect } from "@maple/api-utils"
import { schema } from "db"
import { Schema } from "effect"

export const InstitutionId = Schema.String.pipe(Schema.brand("InstitutionId"))

export class Institution extends Schema.Class<Institution>("Institution")({
	...DrizzleEffect.createSelectSchema(schema.institutions).fields,
	id: InstitutionId,
	countries: Schema.Array(Schema.String),
}) {}

export class InstitutionInsert extends Schema.Class<InstitutionInsert>("InstitutionInsert")({
	...DrizzleEffect.createInsertSchema(schema.institutions).fields,
	id: InstitutionId,
	countries: Schema.Array(Schema.String),
}) {}
