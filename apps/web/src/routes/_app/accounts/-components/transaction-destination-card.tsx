import { Link } from "@tanstack/react-router"
import type { Account, Institution, Transaction } from "db"
import { IconArrowRight, IconChevronLgRight } from "justd-icons"
import { useDrizzleLive } from "~/utils/pglite/drizzle-client"

const formatIBAN = (iban: string) => {
	// Remove all spaces and convert to uppercase
	const cleanIban = iban.replace(/\s/g, "").toUpperCase()
	// Add a space every 4 characters
	return cleanIban.match(/.{1,4}/g)!.join(" ")
}

export interface TransactionDestinationCardProps {
	type: "from" | "to"
	transaction: Transaction & {
		account: Account & {
			institution: Institution
		}
	}
}

const PersonalBankAccountCard = ({
	account,
}: {
	account: Account & {
		institution: Institution
	}
}) => {
	return (
		<Link
			to={"/accounts/$accountId"}
			params={{
				accountId: account.id,
			}}
			className="flex items-center gap-3 rounded-md bg-secondary px-3 py-2 hover:bg-secondary/80"
		>
			<img src={account.institution.logo || ""} alt={account.institution.name} className="size-8" />
			<div className="flex flex-col gap-0.5 text-sm">
				{account.name}
				<p className="text-muted-fg text-xs">{account.iban ? formatIBAN(account.iban) : "No Bank Account"}</p>
			</div>
			<IconChevronLgRight className="size-4 text-muted-fg" />
		</Link>
	)
}

export const TransactionDestinationCard = ({ transaction, type }: TransactionDestinationCardProps) => {
	const { data: accounts } = useDrizzleLive((db) =>
		db.query.accounts.findMany({
			with: {
				institution: true,
			},
		}),
	)

	const isPositive = transaction.amount > 0

	if (type === "from") {
		if (isPositive) {
			const debtorAccount = accounts.find((account) => account.iban === transaction.debtorIban)

			if (debtorAccount) {
				return <PersonalBankAccountCard account={debtorAccount} />
			}

			return (
				<div className="rounded-md bg-secondary px-3 py-2">
					<div className="text-sm">
						{transaction.name}
						<p className="text-muted-fg text-xs">
							{transaction.debtorIban ? formatIBAN(transaction.debtorIban) : "No Bank Account"}
						</p>
					</div>
				</div>
			)
		}

		return <PersonalBankAccountCard account={transaction.account} />
	}

	if (isPositive) {
		return <PersonalBankAccountCard account={transaction.account} />
	}

	const creditorAccount = accounts.find((account) => account.iban === transaction.creditorIban)

	if (creditorAccount) {
		return <PersonalBankAccountCard account={creditorAccount} />
	}

	return (
		<div className="rounded-md bg-secondary px-3 py-2">
			<div className="text-sm">
				{transaction.name}
				<p className="text-muted-fg text-xs">
					{transaction.creditorIban ? formatIBAN(transaction.creditorIban) : "No Bank Account"}
				</p>
			</div>
		</div>
	)
}
