import type { InferInsertModel } from "drizzle-orm"
import { boolean, date, decimal, json, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
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

	type: accountType().notNull().$type<AccountType>(),
})

export const transaction = pgTable("transaction", {
	id: uuid().primaryKey(),
	accountId: text("account_id")
		.notNull()
		.references(() => bankAccount.id),
	plaidTransactionId: text("plaid_transaction_id").unique().notNull(),
	plaidCategoryId: text("plaid_category_id"),
	category: text("category").notNull(),
	subcategory: text("subcategory"),
	type: text("type").notNull(),
	name: text("name").notNull(),
	amount: decimal("amount", { precision: 28, scale: 10 }).notNull(),
	isoCurrencyCode: text("iso_currency_code"),
	unofficalCurrencyCode: text("unoffical_currency_code"),
	date: date("date").notNull(),
	pending: boolean("pending").notNull(),
	accountOwner: text("account_owner"),

	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdateFn(() => new Date()),
})

export type InsertBankAccount = InferInsertModel<typeof bankAccount>
