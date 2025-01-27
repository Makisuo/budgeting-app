import { Model } from "@effect/sql"
import { DateTimeFromDate } from "@effect/sql/Model"
import { Schema } from "effect"
import { TenantId } from "~/authorization"
import { AccountId } from "./account"
import { CategoryId } from "./categories"
import { CompanyId } from "./company"
import { baseFields } from "./utils"

export const TransactionId = Schema.String.pipe(Schema.brand("TransactionId"))
export type TransactionId = typeof TransactionId.Type

export class Transaction extends Model.Class<Transaction>("Transaction")({
	id: Model.GeneratedByApp(TransactionId),
	accountId: Model.GeneratedByApp(AccountId),
	amount: Schema.Number,
	currency: Schema.String,

	date: DateTimeFromDate.annotations({
		jsonSchema: Schema.NullOr(Schema.DateTimeUtc),
	}),

	status: Schema.Literal("posted", "pending"),
	balance: Schema.NullOr(Schema.Number),
	method: Schema.String,
	name: Schema.String,
	description: Schema.NullOr(Schema.String),
	currencyRate: Schema.NullOr(Schema.Number),
	currencySource: Schema.NullOr(Schema.String),

	companyId: Schema.NullOr(CompanyId),
	categoryId: CategoryId,

	debtorIban: Schema.NullOr(Schema.String),
	creditorIban: Schema.NullOr(Schema.String),

	directTransfer: Schema.NullOr(Schema.String),

	tenantId: Model.GeneratedByApp(TenantId),

	...baseFields,
}) {}

export class TransactionNotFound extends Schema.TaggedError<TransactionNotFound>()("TransactionNotFound", {
	id: TransactionId,
}) {}
