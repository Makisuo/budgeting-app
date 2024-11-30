import { useShape } from "@electric-sql/react"
import { bankAccountShape, institutionShape, transactionShape } from "./shapes"

export const useBankAccounts = () => {
	return useShape<any>(bankAccountShape())
}

export const useTransactions = () => {
	return useShape<any>(transactionShape())
}

export const useInstitutions = () => {
	return useShape<any>(institutionShape())
}
