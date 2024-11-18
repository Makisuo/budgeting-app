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

export class CreateAgreementResponse extends Schema.Class<CreateAgreementResponse>("CreateAgreementResponse")({
	id: Schema.String,
	created: Schema.String,
	max_historical_days: Schema.Number,
	access_valid_for_days: Schema.Number,
	access_scope: Schema.Array(Schema.String),
	accepted: Schema.String,
	institution_id: Schema.String,
}) {}

export class CreateLinkResponse extends Schema.Class<CreateLinkResponse>("CreateLinkResponse")({
	id: Schema.String,
	redirect: Schema.String,
	status: Schema.Struct({
		short: Schema.String,
		long: Schema.String,
		description: Schema.String,
	}),
	agreement: Schema.String,
	accounts: Schema.Array(Schema.String),
	reference: Schema.String,
	user_language: Schema.String,
	link: Schema.String,
}) {}
