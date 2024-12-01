import { useShape } from "@electric-sql/react"
import { bankAccountShape, institutionShape, transactionShape } from "./shapes"

import type { Account } from "api/src/models/account"
import type { Institution } from "api/src/models/institution"
import type { Transaction } from "api/src/models/transaction"

export const useBankAccounts = () => {
	return useShape<typeof Account.Encoded>(bankAccountShape())
}

export const useBankAccount = (id: string) => {
	const { data, ...rest } = useBankAccounts()

	return { data: data?.find((item) => item.id === id), ...rest }
}

export const useAllTransactions = () => {
	return useShape<typeof Transaction.Encoded>(transactionShape())
}

export const useTransactions = (accountId: string) => {
	const { data, ...rest } = useAllTransactions()

	return { data: data?.filter((item) => item.accountId === accountId), ...rest }
}

export const useInstitutions = () => {
	return useShape<typeof Institution.Encoded>(institutionShape())
}
