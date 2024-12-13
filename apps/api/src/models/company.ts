import { Model } from "@effect/sql"

import { Schema } from "effect"
import { TenantId } from "~/authorization"
import { InstitutionId } from "./institution"
import { baseFields } from "./utils"

export const CompanyId = Schema.String.pipe(Schema.brand("CompanyId"))

export const CompanyType = Schema.Literal("depository", "credit", "other_asset", "loan", "other_liability")

export class Company extends Model.Class<Company>("Company")({
	id: Model.Generated(CompanyId),
	name: Schema.String,

	assetType: Schema.Literal("isin", "symbol", "wkn", "crypto"),
	assetId: Schema.String,

	patterns: Schema.Array(Schema.String),
}) {}
