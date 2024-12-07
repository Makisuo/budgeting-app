import { DateTime, Match } from "effect"

import { nanoid } from "nanoid"
import type { TenantId } from "~/authorization"
import type { AccountId } from "~/models/account"
import { Transaction, TransactionId } from "~/models/transaction"
import type * as GoCardlessSchema from "./models/models"

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

export const transformTransaction = (
	accountId: typeof AccountId.Type,
	tenantId: typeof TenantId.Type,
	transaction: GoCardlessSchema.Transaction,
	status: "posted" | "pending",
) => {
	const date = DateTime.unsafeFromDate(transaction.bookingDateTime ?? transaction.bookingDate)

	const transactionId = transaction.transactionId || transaction.internalTransactionId || `maple_trs_${nanoid()}`

	return Transaction.insert.make({
		id: TransactionId.make(transactionId),
		accountId,
		tenantId,
		amount: +transaction.transactionAmount.amount,
		currency: transaction.transactionAmount.currency,

		name:
			transaction.creditorName ||
			transaction.debtorName ||
			transaction.remittanceInformationUnstructuredArray?.at(0) ||
			transaction.proprietaryBankTransactionCode ||
			"No Info",
		description: transaction.remittanceInformationUnstructuredArray?.join(", ") || "No Info",

		status: status,
		balance: null,
		category: null,
		currencyRate: null,
		currencySource: null,
		date: date,
		method: mapTransactionMethod(transaction.proprietaryBankTransactionCode),

		deletedAt: null,
	})
}
