import { useShape } from "@electric-sql/react"
import { bankAccountShape, institutionShape, transactionShape } from "./shapes"

import type { Account } from "api/src/models/account"
import type { Institution } from "api/src/models/institution"
import type { Transaction } from "api/src/models/transaction"

export const useBankAccounts = () => {
	return useShape<typeof Account.Encoded>(bankAccountShape())
}

export const useTransactions = () => {
	return useShape<typeof Transaction.Encoded>(transactionShape())
}

export const useInstitutions = () => {
	return useShape<typeof Institution.Encoded>(institutionShape())
}
