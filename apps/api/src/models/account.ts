import { Model } from "@effect/sql"

import { Schema } from "effect"
import { TenantId } from "~/authorization"
import { InstitutionId } from "./institution"
import { baseFields } from "./utils"

export const AccountId = Schema.String.pipe(Schema.brand("AccountId"))

export const AccountType = Schema.Literal("depository", "credit", "other_asset", "loan", "other_liability")

export class Account extends Model.Class<Account>("Account")({
	id: Model.GeneratedByApp(AccountId),
	name: Schema.String,
	currency: Schema.String,
	type: AccountType,
	institutionId: InstitutionId,

	balanceAmount: Schema.Number,
	balanceCurrency: Schema.String,

	lastSync: Model.GeneratedByApp(
		Schema.NullOr(Model.DateTimeFromDate).annotations({
			jsonSchema: Schema.NullOr(Schema.DateTimeUtc),
		}),
	),

	tenantId: Model.GeneratedByApp(TenantId),

	...baseFields,
}) {}
