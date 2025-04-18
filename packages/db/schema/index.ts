import { relations, sql } from "drizzle-orm"
import { doublePrecision, index, integer, jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"

import type { Account, Auth, Category, Company, Institution, Requisition, Transaction } from "@maple/api-utils/models"
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
	id: text().primaryKey().notNull().$type<typeof Requisition.Id.Type>(),
	status: text().notNull(),
	referenceId: text("reference_id").notNull(),
	institutionId: text("institution_id").notNull().$type<typeof Institution.Id.Type>(),

	tenantId: text("tenant_id").notNull().$type<typeof Auth.TenantId.Type>(),

	...defaultFields,
})

// Public Table
export const institutions = pgTable(
	"institutions",
	{
		id: text().primaryKey().notNull().$type<typeof Institution.Id.Type>(),
		name: text().notNull(),
		logo: text(),
		provider: text().notNull(),
		countries: jsonb().notNull().$type<readonly string[]>(),
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
		id: text().primaryKey().notNull().$type<typeof Company.Id.Type>(),
		name: text().notNull(),
		url: text("url").notNull(),

		categoryId: text("category_id").notNull().$type<typeof Category.Id.Type>(),

		patterns: jsonb().notNull().$type<string[]>(),
	},
	(table) => ({
		patternsIdx: index("patterns_idx").using("gin", table.patterns),
	}),
)

export const categories = pgTable("categories", {
	id: text().primaryKey().notNull().$type<typeof Category.Id.Type>(),
	name: text().notNull(),
	type: text().notNull().$type<(typeof category_types)[number]>(),
})

// User Tables
export const accounts = pgTable(
	"accounts",
	{
		id: text().primaryKey().notNull().$type<typeof Account.Id.Type>(),
		name: text().notNull(),
		currency: text().notNull(),
		type: accountType().notNull(),
		institutionId: text("institution_id").notNull().$type<typeof Institution.Id.Type>(),
		balanceAmount: doublePrecision("balance_amount").notNull(),
		balanceCurrency: text("balance_currency").notNull(),

		tenantId: text("tenant_id").notNull().$type<typeof Auth.TenantId.Type>(),
		iban: text("iban"),

		lastSync: timestamp("last_sync", { precision: 3 }),

		...defaultFields,
	},
	(table) => {
		return {
			idx_id: index("idx_id").on(table.id, table.tenantId),
		}
	},
)

export const subscriptions = pgTable("subscriptions", {
	id: text().primaryKey().notNull(),
	frequency: subscriptionFrequency().notNull(),

	status: subscriptionStatus().notNull(),
	nextExpectedPayment: timestamp("next_expected_payment", { precision: 3 }),

	currency: text().notNull(),
	amount: doublePrecision("amount").notNull(),

	tenantId: text("tenant_id").notNull().$type<typeof Auth.TenantId.Type>(),
	...defaultFields,
})

export const transactions = pgTable(
	"transactions",
	{
		id: text().primaryKey().notNull().$type<typeof Transaction.Id.Type>(),
		amount: doublePrecision().notNull(),
		currency: text().notNull(),
		date: timestamp({ precision: 3 }).notNull(),
		status: transactionStatus().notNull(),
		balance: doublePrecision(),
		categoryId: text("category_id").notNull().$type<typeof Category.Id.Type>(),
		method: text().notNull(),
		name: text().notNull(),
		description: text(),
		currencyRate: doublePrecision("currency_rate"),
		currencySource: text("currency_source"),
		accountId: text("account_id").notNull().$type<typeof Account.Id.Type>(),

		debtorIban: text("debtor_iban"),
		creditorIban: text("creditor_iban"),

		companyId: text("company_id").$type<typeof Company.Id.Type | null>(),

		tenantId: text("tenant_id").notNull().$type<typeof Auth.TenantId.Type>(),

		directTransfer: text("direct_transfer"),
		...defaultFields,
	},
	(table) => {
		return {
			idx_transactions_tenant_currency_amount: index("idx_transactions_tenant_currency_amount").on(
				table.tenantId,
				table.currency,
				table.amount,
			),
			idx_accounts_tenant_currency_amount: index("idx_accounts_tenant_currency_amount").on(
				table.accountId,
				table.tenantId,
				table.currency,
			),
			idx_date: index("idx_date").on(table.date),
		}
	},
)

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
