import { Model } from "@effect/sql"

import { Schema } from "effect"

export const CompanyId = Schema.String.pipe(Schema.brand("CompanyId"))

export class Company extends Model.Class<Company>("Company")({
	id: Model.Generated(CompanyId),
	name: Schema.String,

	url: Schema.String,

	patterns: Schema.Array(Schema.String),
}) {}
