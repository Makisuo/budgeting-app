import type { InferInsertModel } from "drizzle-orm"
import {
	boolean,
	date,
	decimal,
	integer,
	json,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core"
import { type AccountBalance, AccountType, type AssetReportAccountBalance, type Location } from "plaid"
import { user } from "./auth-schema"
import { requisition } from "./gocardless"

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
	iban: text(),

	currentBalance: decimal("current_balance", { precision: 28, scale: 10 }),
	availableBalance: decimal("available_balance", { precision: 28, scale: 10 }),
	limit: decimal("limit", { precision: 28, scale: 10 }),

	isoCurrencyCode: text("iso_currency_code"),
	unofficialCurrencyCode: text("unofficial_currency_code"),

	requistionId: text("requisition_id")
		.notNull()
		.references(() => requisition.id),

	type: accountType().notNull().$type<AccountType>(),
})

export const transaction = pgTable("transaction", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id")
		.notNull()
		.references(() => bankAccount.id),
	name: text("name").notNull(),
	description: text("description"),

	amount: decimal("amount", { precision: 28, scale: 10 }).notNull(),
	isoCurrencyCode: text("iso_currency_code"),
	pending: boolean("pending").notNull(),
	accountOwner: text("account_owner"),

	personalCategory: text("personal_category"),

	website: text("website"),
	logoUrl: text("logo_url"),

	date: date("date").notNull(),

	authorizedAt: timestamp("authorized_at", { mode: "string" }),
	postedAt: timestamp("posted_at", { mode: "string" }),

	location: jsonb("location").$type<Location>(),

	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdateFn(() => new Date()),
})

export type InsertBankAccount = InferInsertModel<typeof bankAccount>
