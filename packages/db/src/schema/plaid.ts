import { json, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core"
import { AccountType, type AssetReportAccountBalance } from "plaid"
import { user } from "./auth-schema"

export const plaidItem = pgTable("plaid_item", {
	id: text().primaryKey(),
	userId: text()
		.notNull()
		.references(() => user.id),
	accessToken: text().notNull(),
})

export const accountType = pgEnum("account_type", [
	AccountType.Brokerage,
	AccountType.Credit,
	AccountType.Investment,
	AccountType.Loan,
	AccountType.Other,
])

export const bankAccount = pgTable("bank_account", {
	id: text().notNull().unique(),
	name: text().notNull(),
	// The official name of the account as given by the financial institution
	official_name: text(),
	mask: text(),
	balance: json().$type<AssetReportAccountBalance>().notNull(),

	type: accountType().notNull(),
})
