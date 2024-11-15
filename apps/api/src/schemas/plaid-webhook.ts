import { Schema } from "effect"

export class PlaidWebhook extends Schema.Class<PlaidWebhook>("PlaidWebhook")({
	webhook_type: Schema.Literal("TRANSACTIONS"),
	webhook_code: Schema.Literal(
		"SYNC_UPDATES_AVAILABLE",
		"RECURRING_TRANSACTIONS_UPDATE",
		"INITIAL_UPDATE",
		"HISTORICAL_UPDATE",
		"DEFAULT_UPDATE",
		"TRANSACTIONS_REMOVED",
	),
	item_id: Schema.String,
	// initial_update_complete: Schema.Boolean,
	// historical_update_complete: Schema.Boolean,
	environment: Schema.Literal("sandbox", "production"),
}) {}
