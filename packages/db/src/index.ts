import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import * as schema from "./schema"

export { schema }

export * from "drizzle-orm"

export const getDb = (connectionString: string) =>
	drizzle({
		connection: connectionString,
		schema,
		// casing: "snake_case",
	})

export type BankAccount = InferSelectModel<typeof schema.bankAccount>
export type InsertBankAccount = InferInsertModel<typeof schema.bankAccount>

export type Transaction = InferSelectModel<typeof schema.transaction>
export type InsertTransaction = InferInsertModel<typeof schema.transaction>

export type Institution = InferSelectModel<typeof schema.institution>
