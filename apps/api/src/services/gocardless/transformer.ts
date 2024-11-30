import { DateTime, Effect, Match, Schema } from "effect"

import { Account } from "~/models/account"
import type { Institution } from "~/models/institution"
import { Transaction } from "~/models/transaction"
import type * as GoCardlessSchema from "./models"

const matchTransactionCategory = Match.type<GoCardlessSchema.Transaction>().pipe(
	Match.when(
		{
			transactionAmount: {
				amount: (amount) => Number(amount) > 0,
			},
		},
		() => "income",
	),
	Match.when(
		{
			proprietaryBankTransactionCode: "Transfer",
		},
		() => "transfer",
	),
	Match.orElse(() => null),
)

export const mapTransactionMethod = (type: string | undefined) => {
	switch (type) {
		case "Payment":
		case "Bankgiro payment":
		case "Incoming foreign payment":
			return "payment"
		case "Card purchase":
		case "Card foreign purchase":
			return "card_purchase"
		case "Card ATM":
			return "card_atm"
		case "Transfer":
			return "transfer"
		default:
			return "other"
	}
}

// const transformAccount = (account: GoCardlessSchema.Account) =>
// 	Effect.gen(function* () {
// 		const now = yield* DateTime.now

// 		return Account.insert.make({
// 			name: account.owner_name,
// 			currency: account.c,
// 			type: "depository",
// 			balanceAmount: account.balanceAmount.amount,
// 			balanceCurrency: account.balanceAmount.currency,
// 			deletedAt: null,
// 			institutionId: undefined,
// 		})
// 	})
