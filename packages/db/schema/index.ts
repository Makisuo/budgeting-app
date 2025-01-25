import { relations, sql } from "drizzle-orm"
import { doublePrecision, index, integer, jsonb, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"

import type { category_types } from "../data/categories"

export const accountType = pgEnum("account_type", ["depository", "credit", "other_asset", "loan", "other_liability"])
export const transactionStatus = pgEnum("transaction_status", ["posted", "pending"])

export const subscriptionFrequency = pgEnum("subscription_frequency", ["monthly", "yearly", "weekly"])
export const subscriptionStatus = pgEnum("subscription_status", ["active", "canceled", "expired"])

const defaultFields = {
	createdAt: timestamp("created_at", { precision: 3 }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3 }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	deletedAt: timestamp("deleted_at", { precision: 3 }),
}

export * from "./auth-schema"

// Internal Table
export const requisitions = pgTable("requisitions", {
	id: text().primaryKey().notNull(),
	status: text().notNull(),
	referenceId: text("reference_id").notNull(),
	institutionId: text("institution_id").notNull(),

	tenantId: text("tenant_id").notNull(),

	...defaultFields,
})

// Public Table
export const institutions = pgTable(
	"institutions",
	{
		id: text().primaryKey().notNull(),
		name: text().notNull(),
		logo: text(),
		provider: text().notNull(),
		countries: jsonb().notNull().$type<string[]>(),
		transactionTotalDays: integer("transaction_total_days").notNull(),
		...defaultFields,
	},
	(table) => {
		return {
			nameIndex: index("name_index").on(table.name),
			nameCountryIndex: index("name_country_index").on(table.name, table.countries),
		}
	},
)

export const companies = pgTable(
	"companies",
	{
		id: text().primaryKey().notNull(),
		name: text().notNull(),
		url: text("url").notNull(),

		categoryId: text("category_id").notNull(),

		patterns: jsonb().notNull().$type<string[]>(),
	},
	(table) => ({
		patternsIdx: index("patterns_idx").using("gin", table.patterns),
	}),
)

export const categories = pgTable("categories", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	type: text().notNull().$type<(typeof category_types)[number]>(),
})

// User Tables
export const accounts = pgTable("accounts", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	currency: text().notNull(),
	type: accountType().notNull(),
	institutionId: text("institution_id").notNull(),
	balanceAmount: doublePrecision("balance_amount").notNull(),
	balanceCurrency: text("balance_currency").notNull(),

	tenantId: text("tenant_id").notNull(),

	lastSync: timestamp("last_sync", { precision: 3 }),

	...defaultFields,
})

export const subscriptions = pgTable("subscriptions", {
	id: text().primaryKey().notNull(),
	frequency: subscriptionFrequency().notNull(),

	status: subscriptionStatus().notNull(),
	nextExpectedPayment: timestamp("next_expected_payment", { precision: 3 }),

	currency: text().notNull(),
	amount: doublePrecision("amount").notNull(),

	tenantId: text("tenant_id").notNull(),
	...defaultFields,
})

export const transactions = pgTable("transactions", {
	id: text().primaryKey().notNull(),
	amount: doublePrecision().notNull(),
	currency: text().notNull(),
	date: timestamp({ precision: 3 }).notNull(),
	status: transactionStatus().notNull(),
	balance: doublePrecision(),
	categoryId: text("category_id").notNull(),
	method: text().notNull(),
	name: text().notNull(),
	description: text(),
	currencyRate: doublePrecision("currency_rate"),
	currencySource: text("currency_source"),
	accountId: text("account_id").notNull(),

	debtorIban: text("debtor_iban"),
	creditorIban: text("creditor_iban"),

	companyId: text("company_id"),

	tenantId: text("tenant_id").notNull(),
	...defaultFields,
})

export const accountsRelations = relations(accounts, ({ one, many }) => ({
	institution: one(institutions, {
		fields: [accounts.institutionId],
		references: [institutions.id],
	}),
	transactions: many(transactions),
}))

export const institutionsRelations = relations(institutions, ({ many }) => ({
	accounts: many(accounts),
}))

export const transactionsRelations = relations(transactions, ({ one }) => ({
	account: one(accounts, {
		fields: [transactions.accountId],
		references: [accounts.id],
	}),
	company: one(companies, {
		fields: [transactions.companyId],
		references: [companies.id],
	}),
	category: one(categories, {
		fields: [transactions.categoryId],
		references: [categories.id],
	}),
}))
