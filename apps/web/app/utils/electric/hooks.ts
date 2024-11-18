import { useShape } from "@electric-sql/react"
import type { BankAccount, Institution, Transaction } from "db"
import type { CamelToSnake } from "../typer-helper"
import { bankAccountShape, institutionShape, transactionShape } from "./shapes"

export const useBankAccounts = () => {
	return useShape<CamelToSnake<BankAccount>>(bankAccountShape())
}

export const useTransactions = () => {
	return useShape<CamelToSnake<Transaction>>(transactionShape())
}

export const useInstitutions = () => {
	return useShape<CamelToSnake<Institution>>(institutionShape())
}
