import type { InferInsertModel } from "drizzle-orm"
import { json, pgEnum, pgTable, text } from "drizzle-orm/pg-core"
import { type AccountBalance, AccountType, type AssetReportAccountBalance } from "plaid"
import { user } from "./auth-schema"

export const plaidItem = pgTable("plaid_item", {
	id: text().primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	institutionId: text("institution_id"),
	accessToken: text("access_token").notNull(),
	transactionsCursor: text("transactions_cursor"),
})

export const accountType = pgEnum("account_type", [
	AccountType.Brokerage,
	AccountType.Credit,
	AccountType.Investment,
	AccountType.Loan,
	AccountType.Other,
	AccountType.Depository,
])

export const bankAccount = pgTable("bank_account", {
	id: text().notNull().primaryKey(),
	name: text().notNull(),
	// The official name of the account as given by the financial institution
	officialName: text("official_name"),
	mask: text(),
	balance: json().$type<AccountBalance>().notNull(),

	plaidItemId: text("plaid_item_id")
		.notNull()
		.references(() => plaidItem.id),

	userId: text("user_id")
		.notNull()
		.references(() => user.id),

	type: accountType().notNull().$type<AccountType>(),
})

export type InsertBankAccount = InferInsertModel<typeof bankAccount>
