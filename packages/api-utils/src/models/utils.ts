import { Model } from "@effect/sql"
import { Schema } from "effect"

export const baseFields = {
	createdAt: Model.Generated(Schema.DateFromString),
	updatedAt: Model.GeneratedByApp(Schema.DateFromString),
	deletedAt: Model.GeneratedByApp(Schema.NullOr(Schema.DateFromString)),
}
