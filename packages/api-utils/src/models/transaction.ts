import { Model } from "@effect/sql"
import { DateTimeFromDate } from "@effect/sql/Model"
import { Schema } from "effect"
import * as Account from "./account"
import { TenantId } from "./auth"
import * as Category from "./category"
import { CompanyId } from "./company"
import { baseFields } from "./utils"

export const TransactionId = Schema.String.pipe(Schema.brand("TransactionId"))
export type TransactionId = typeof TransactionId.Type

export class Transaction extends Model.Class<Transaction>("Transaction")({
	id: Model.GeneratedByApp(TransactionId),
	accountId: Model.GeneratedByApp(Account.Id),
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
	categoryId: Category.Id,

	debtorIban: Schema.NullOr(Schema.String),
	creditorIban: Schema.NullOr(Schema.String),

	directTransfer: Schema.NullOr(Schema.String),

	tenantId: Model.GeneratedByApp(TenantId),

	...baseFields,
}) {}

export class TransactionNotFound extends Schema.TaggedError<TransactionNotFound>()("TransactionNotFound", {
	id: TransactionId,
}) {}
