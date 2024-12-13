import { Model } from "@effect/sql"

import { Schema } from "effect"

export const CategoryId = Schema.String.pipe(Schema.brand("CategoryId"))

export class Category extends Model.Class<Category>("Category")({
	id: Schema.String,
	name: Schema.String,
	type: Schema.String,
}) {}
