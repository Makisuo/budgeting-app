import { Schema } from "effect"

export class Institution extends Schema.Class<Institution>("Institution")({
	id: Schema.String,
	name: Schema.String,
	bic: Schema.String,
	transaction_total_days: Schema.NumberFromString,
	countries: Schema.Array(Schema.String),
	logo: Schema.String,
	max_access_valid_for_days: Schema.NumberFromString,
}) {}

export class NewTokenResponse extends Schema.Class<NewTokenResponse>("NewTokenResponse")({
	access: Schema.String,
	access_expires: Schema.Number,
	refresh: Schema.String,
	refresh_expires: Schema.Number,
}) {}
