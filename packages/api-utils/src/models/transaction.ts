import { Model as M } from "@effect/sql"
import { schema } from "db"
import { Schema } from "effect"
import { DrizzleEffect } from "../services"
import * as Account from "./account"
import { TenantId } from "./auth"
import * as Category from "./category"
import * as Company from "./company"
import { baseFields } from "./utils"

export const Id = Schema.String.pipe(Schema.brand("TransactionId"))
export type Id = typeof Id.Type

export class Model extends M.Class<Model>("Transaction")({
	...DrizzleEffect.createSelectSchema(schema.transactions).fields,
	id: M.GeneratedByApp(Id),
	accountId: M.GeneratedByApp(Account.Id),

	companyId: Schema.NullOr(Company.Id),
	categoryId: Category.Id,

	tenantId: M.GeneratedByApp(TenantId),

	date: Schema.DateFromString,

	...baseFields,
}) {}

export class TransactionNotFound extends Schema.TaggedError<TransactionNotFound>()("TransactionNotFound", {
	id: Id,
}) {}
