import type { InferInsertModel, InferSelectModel } from "drizzle-orm"

import * as schema from "./schema"

import migrations from "./migrations/export.json"

export type Account = InferSelectModel<typeof schema.accounts>
export type Institution = InferSelectModel<typeof schema.institutions>
export type Transaction = InferSelectModel<typeof schema.transactions>
export type Company = InferSelectModel<typeof schema.companies>

export type InsertCompany = InferInsertModel<typeof schema.companies>

export { schema }

export const frontMigrations = migrations
