import { Model } from "@effect/sql"

import { Schema } from "effect"
import { CategoryId } from "./categories"

export const CompanyId = Schema.String.pipe(Schema.brand("CompanyId"))

export class Company extends Model.Class<Company>("Company")({
	id: Model.Generated(CompanyId),
	name: Schema.String,

	url: Schema.String,

	categoryId: CategoryId,

	patterns: Schema.Array(Schema.String),
}) {}
