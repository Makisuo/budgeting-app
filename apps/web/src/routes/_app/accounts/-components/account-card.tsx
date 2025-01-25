import { Link } from "@tanstack/react-router"
import type { Account, Institution, Transaction } from "db"
import { IconCube } from "justd-icons"
import { useMemo } from "react"
import { Card, type ChartConfig } from "ui"
import { SparkBarChart } from "~/components/ui/spark-chart"
import { cn } from "~/utils/classes"
import { currencyFormatter } from "~/utils/formatters"

export interface AccountCardProps {
	className?: string
	account: Account & {
		institution: Institution
		transactions: Transaction[]
	}
	compact?: boolean
}

const config = {
	income: {
		label: "Income",
		color: "var(--success)",
	},
	outgoings: {
		label: "Outgoings",
		color: "var(--danger)",
	},
} satisfies ChartConfig

const aggregateDailyTransactions = (transactions: Transaction[]) => {
	const endDate = new Date()
	const startDate = new Date()
	startDate.setDate(endDate.getDate() - 13)

	// Initialize all dates in range
	const dateRange: Record<string, { date: string; income: number; outgoings: number; balance: number }> = {}
	for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
		const dateKey = d.toISOString().split("T")[0]
		dateRange[dateKey] = {
			date: dateKey,
			income: 0,
			outgoings: 0,
			balance: 0,
		}
	}

	// Aggregate transactions within date range
	return transactions.reduce<typeof dateRange>((acc, transaction) => {
		const transactionDate = new Date(transaction.date)
		if (transactionDate >= startDate && transactionDate <= endDate) {
			const dateKey = transactionDate.toISOString().split("T")[0]
			const amount = Number(transaction.amount)

			if (amount > 0) {
				acc[dateKey].income += amount
			} else {
				acc[dateKey].outgoings += Math.abs(amount)
			}

			acc[dateKey].balance = acc[dateKey].income - acc[dateKey].outgoings
		}
		return acc
	}, dateRange)
}

export const AccountCard = ({ account, className, compact }: AccountCardProps) => {
	const dailyTransactions = useMemo(
		() => Object.values(aggregateDailyTransactions(account.transactions)),
		[account.transactions],
	)

	return (
		<Link to={"/accounts/$accountId"} params={{ accountId: account.id }}>
			<Card className={cn("flex h-full min-w-[220px] flex-col justify-between", className)}>
				<Card.Header>
					<div className="flex flex-row items-center gap-2">
						{account.institution.logo ? (
							<img className="size-4" src={account.institution.logo!} alt={account.institution.name} />
						) : (
							<IconCube className="size-4" />
						)}
						<Card.Title>{account.institution.name}</Card.Title>
					</div>
					{account.iban && <Card.Description>{account.iban}</Card.Description>}
				</Card.Header>
				<Card.Content>
					<Card.Description>Current Balance</Card.Description>
					{currencyFormatter(account.balanceCurrency).format(account.balanceAmount)}
				</Card.Content>
				{!compact && (
					<SparkBarChart className="w-full" config={config} data={dailyTransactions} dataKey="date" />
				)}
			</Card>
		</Link>
	)
}
