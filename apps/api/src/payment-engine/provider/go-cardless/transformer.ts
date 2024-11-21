import { Match, Schema } from "effect"

import { Transaction } from "~/payment-engine/payment-engine"
import * as GoCardlessSchema from "./models"

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

const GoCardlessTransactionTransformer = Schema.transform(
	GoCardlessSchema.Transaction,
	Schema.typeSchema(Transaction),
	{
		strict: true,
		decode: (transaction) => {
			const method = mapTransactionMethod(transaction.proprietaryBankTransactionCode)

			return {
				id: transaction.transactionId,
				amount: transaction.transactionAmount.amount,
				currency: transaction.transactionAmount.currency,
				date: transaction.bookingDate,
				category: matchTransactionCategory(transaction),
				method: method,
				name: transaction.creditorName,
				description: transaction.remittanceInformationUnstructuredArray.join(", "),
				status: "posted" as const,
			}
		},
		encode: () => {
			return {
				transactionId: "",
				transactionAmount: {
					currency: "",
					amount: "",
				},
				bankTransactionCode: "",
				bookingDate: new Date(),
				valueDate: new Date(),
				bookingDateTime: new Date(),
				valueDateTime: new Date(),
				creditorName: "",
				remittanceInformationUnstructuredArray: [],
				proprietaryBankTransactionCode: "",
				internalTransactionId: "",
			}
		},
	},
)
