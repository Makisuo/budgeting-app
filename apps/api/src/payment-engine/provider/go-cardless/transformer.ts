import { Match, Schema } from "effect"

import { Transaction } from "~/payment-engine/payment-engine"
import * as GoCardlessSchema from "./models"

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
				status: "posted" as const,
				category: "",
				method: method,
				name: "",
				description: "",
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
