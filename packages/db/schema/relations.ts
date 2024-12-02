import { relations } from "drizzle-orm/relations"
import { accounts, institutions, transactions } from "."

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
}))
