import { Link } from "@tanstack/react-router"
import type { Account, Institution, Transaction } from "db"
import { IconCube } from "justd-icons"
import { useMemo } from "react"
import { Bar, BarChart } from "recharts"
import { Card, Chart, type ChartConfig, ChartTooltip, ChartTooltipContent } from "ui"
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
		color: "hsl(var(--success))",
	},
	outgoings: {
		label: "Outgoings",
		color: "hsl(var(--danger))",
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
			<Card className={cn("min-w-[220px]", className)}>
				<Card.Header>
					<div className="flex flex-row items-center gap-2">
						{account.institution.logo ? (
							<img className="size-4" src={account.institution.logo!} alt={account.institution.name} />
						) : (
							<IconCube className="size-4" />
						)}
						<Card.Title>{account.institution.name}</Card.Title>
					</div>
				</Card.Header>
				<Card.Content>
					<Card.Description>Current Balance</Card.Description>
					{currencyFormatter(account.balanceCurrency).format(account.balanceAmount)}
				</Card.Content>
				{!compact && (
					<Chart className="h-[60px] w-full" config={config}>
						<BarChart accessibilityLayer data={dailyTransactions}>
							<ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
							<Bar dataKey="income" stackId={account.id} fill="var(--color-income)" radius={3} />
							<Bar dataKey="outgoings" stackId={account.id} fill="var(--color-outgoings)" radius={3} />
						</BarChart>
					</Chart>
				)}
			</Card>
		</Link>
	)
}
