import { useShape } from "@electric-sql/react"
import type { BankAccount, Transaction } from "db"
import type { CamelToSnake } from "../typer-helper"
import { bankAccountShape, transactionShape } from "./shapes"

export const useBankAccounts = () => {
	return useShape<CamelToSnake<BankAccount>>(bankAccountShape())
}

export const useTransactions = () => {
	return useShape<CamelToSnake<Transaction>>(transactionShape())
}
