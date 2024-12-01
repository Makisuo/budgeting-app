import { useShape } from "@electric-sql/react"
import { bankAccountShape, institutionShape, transactionShape } from "./shapes"

import type { Transaction } from "api/src/models/transaction"

export const useBankAccounts = () => {
	return useShape<any>(bankAccountShape())
}

export const useTransactions = () => {
	return useShape<typeof Transaction.Encoded>(transactionShape())
}

export const useInstitutions = () => {
	return useShape<any>(institutionShape())
}
