import { Model } from "@effect/sql"

import { Schema } from "effect"
import * as Category from "./category"

export const CompanyId = Schema.String.pipe(Schema.brand("CompanyId"))

export class Company extends Model.Class<Company>("Company")({
	id: Model.Generated(CompanyId),
	name: Schema.String,

	url: Schema.String,

	categoryId: Category.Id,

	patterns: Schema.Array(Schema.String),
}) {}
