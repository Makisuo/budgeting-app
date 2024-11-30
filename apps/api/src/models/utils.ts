import { Model } from "@effect/sql"
import { Schema } from "effect"

export const baseFields = {
	createdAt: Model.DateTimeInsertFromDate,
	updatedAt: Model.DateTimeUpdateFromDate,
	deletedAt: Model.GeneratedByApp(Schema.NullOr(Schema.DateFromString)),
}
