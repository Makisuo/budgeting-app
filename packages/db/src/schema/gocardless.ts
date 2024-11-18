import { integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core"

export const institution = pgTable("institution", {
	id: text().primaryKey().notNull(),
	name: text("name").notNull(),
	bic: text("bic").notNull(),
	transaction_total_days: integer("transaction_total_days").notNull(),
	countries: text("countries").array().notNull().default([]),
	logo: text("logo").notNull(),
	max_access_valid_for_days: integer("max_access_valid_for_days").notNull(),
})

export const requisitionStatus = pgEnum("requisition_status", ["created", "pending", "active"])

export const requisition = pgTable("requisition", {
	id: text().primaryKey().notNull(),
	institution_id: text("institution_id").notNull(),
	reference_id: text("reference_id").unique().notNull(),
	status: requisitionStatus("status").notNull(),
})
