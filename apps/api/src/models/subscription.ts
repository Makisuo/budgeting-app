import { Model } from "@effect/sql"
import { DateTimeFromDate } from "@effect/sql/Model"
import { Schema } from "effect"
import { TenantId } from "~/authorization"
import { AccountId } from "./account"
import { baseFields } from "./utils"

export const SubscriptionId = Schema.String.pipe(Schema.brand("SubscriptionId"))

export class Subscription extends Model.Class<Subscription>("Subscription")({
	id: Model.GeneratedByApp(SubscriptionId),

	accountId: Model.GeneratedByApp(AccountId),
	tenantId: Model.GeneratedByApp(TenantId),

	status: Schema.Literal("active", "canceled", "expired"),
	nextExpectedPayment: DateTimeFromDate.annotations({
		jsonSchema: Schema.NullOr(Schema.DateTimeUtc),
	}),
	currency: Schema.String,
	amount: Schema.Number,

	frequency: Schema.Literal("monthly", "yearly", "weekly"),

	...baseFields,
}) {}
