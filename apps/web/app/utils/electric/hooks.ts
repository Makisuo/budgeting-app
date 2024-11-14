import { useShape } from "@electric-sql/react"
import type { BankAccount } from "db"
import { bankAccountShape } from "./shapes"

export const useBankAccounts = () => {
	return useShape<BankAccount>(bankAccountShape())
}
