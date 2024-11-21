import { PgDrizzle } from "@effect/sql-drizzle/Pg"
import { Effect, Schema } from "effect"
import { DrizzleLive } from "../services/db-service"

export class Transaction extends Schema.Class<Transaction>("Transaction")({
	id: Schema.String,
	amount: Schema.String,
	currency: Schema.String,
	date: Schema.DateFromString,
	status: Schema.Literal("posted", "pending"),
	category: Schema.NullOr(Schema.String),
	method: Schema.String,
	name: Schema.String,
	description: Schema.NullOr(Schema.String),
}) {}

export const Providers = Schema.Literal("plaid", "gocardless")

export const AccountType = Schema.Literal("depository", "credit", "other_asset", "loan", "other_liability")

export class Institution extends Schema.Class<Institution>("Institution")({
	id: Schema.String,
	name: Schema.String,
	logo: Schema.NullOr(Schema.String),
	provider: Providers,
}) {}

export class Balance extends Schema.Class<Balance>("Balance")({
	amount: Schema.Number,
	currency: Schema.String,
}) {}

export class Account extends Schema.Class<Account>("Account")({
	id: Schema.String,
	name: Schema.String,
	institutionId: Schema.String,
	currency: Schema.String,
	balance: Balance,
	type: AccountType,
}) {}

export class PaymentEngine extends Effect.Service<PaymentEngine>()("PaymentEngine", {
	effect: Effect.gen(function* () {
		const db = yield* PgDrizzle
		return {
			saveTransactions: (transactions: Transaction[]) => Effect.succeed("WOW"),
		}
	}),
	dependencies: [DrizzleLive],
}) {}
