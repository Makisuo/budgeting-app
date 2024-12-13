import { Model } from "@effect/sql"

import { Schema } from "effect"

export const CompanyId = Schema.Number.pipe(Schema.brand("CompanyId"))

export const CompanyType = Schema.Literal("depository", "credit", "other_asset", "loan", "other_liability")

export class Company extends Model.Class<Company>("Company")({
	id: Model.Generated(CompanyId),
	name: Schema.String,

	assetType: Schema.Literal("isin", "symbol", "wkn", "crypto"),
	assetId: Schema.String,

	patterns: Schema.Array(Schema.String),
}) {}
