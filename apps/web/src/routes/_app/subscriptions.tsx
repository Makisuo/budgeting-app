import { createFileRoute } from "@tanstack/react-router"
import type { Transaction } from "db"
import { useMemo } from "react"
import { Card, Heading } from "~/components/ui"
import { Table } from "~/components/ui/table"
import { useDrizzleLive } from "~/utils/pglite/drizzle-client"

export const Route = createFileRoute("/_app/subscriptions")({
	component: RouteComponent,
})

function RouteComponent() {
	const { data: transactions } = useDrizzleLive((db) => db.query.transactions.findMany({}))

	const detectedSubscriptions = useMemo(() => detectSubscriptions(transactions), [transactions])

	return (
		<div className="flex flex-col gap-6">
			<Heading level={1}>Potential subscriptions</Heading>
			<Card>
				<Table aria-label="Potential subscriptions">
					<Table.Header>
						<Table.Column isRowHeader>Name</Table.Column>
						<Table.Column>Frequency</Table.Column>
						<Table.Column>Confidence</Table.Column>
						<Table.Column>Num of transactions</Table.Column>
						<Table.Column>Amount</Table.Column>
					</Table.Header>
					<Table.Body items={detectedSubscriptions}>
						{(item) => (
							<Table.Row id={item.name + item.amount}>
								<Table.Cell>{item.name}</Table.Cell>
								<Table.Cell>{item.frequency}</Table.Cell>
								<Table.Cell>{item.confidence}</Table.Cell>
								<Table.Cell>{item.transactions.length}</Table.Cell>
								<Table.Cell>{item.amount}</Table.Cell>
							</Table.Row>
						)}
					</Table.Body>
				</Table>
			</Card>
		</div>
	)
}

interface SubscriptionPattern {
	name: string
	amount: number
	currency: string
	frequency: "monthly" | "yearly" | "weekly"
	transactions: Transaction[]
	confidence: number
	averageInterval: number // in days
}

function detectSubscriptions(transactions: Transaction[]): SubscriptionPattern[] {
	// Sort transactions by date
	const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

	// Group transactions by name and similar amount
	const groups = sortedTransactions.reduce(
		(acc, transaction) => {
			const amount = Math.round(transaction.amount * 100) / 100
			const key = `${transaction.name}_${amount}_${transaction.currency}`

			return {
				// biome-ignore lint/performance/noAccumulatingSpread: <explanation>
				...acc,
				[key]: [...(acc[key] || []), transaction],
			}
		},
		{} as Record<string, Transaction[]>,
	)

	// Analyze groups for subscription patterns
	const subscriptions = Object.entries(groups)
		.map(([key, transactions]) => {
			if (transactions.length < 2) return null

			// Calculate intervals between transactions
			const intervals = transactions.slice(1).map((transaction, index) => {
				const daysDiff =
					(new Date(transaction.date).getTime() - new Date(transactions[index].date).getTime()) /
					(1000 * 60 * 60 * 24)
				return daysDiff
			})

			const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
			const standardDeviation = calculateStandardDeviation(intervals)

			// Determine subscription type and confidence
			const { frequency, confidence } = determineSubscriptionType(averageInterval, standardDeviation)

			// Only include if confidence is high enough
			if (confidence <= 0.5) return null

			const [name, amount, currency] = key.split("_")
			return {
				name,
				amount: Number.parseFloat(amount),
				currency,
				frequency,
				transactions,
				confidence,
				averageInterval,
			}
		})
		.filter((subscription): subscription is SubscriptionPattern => subscription !== null)

	return subscriptions
}

function calculateStandardDeviation(values: number[]): number {
	const avg = values.reduce((a, b) => a + b, 0) / values.length
	const squareDiffs = values.map((value) => (value - avg) ** 2)
	return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length)
}

function determineSubscriptionType(
	averageInterval: number,
	standardDeviation: number,
): { frequency: "monthly" | "yearly" | "weekly"; confidence: number } {
	const subscriptionTypes = [
		{
			frequency: "monthly" as const,
			minDays: 25,
			maxDays: 35,
			tolerance: 5,
		},
		{
			frequency: "yearly" as const,
			minDays: 350,
			maxDays: 380,
			tolerance: 15,
		},
		{
			frequency: "weekly" as const,
			minDays: 6,
			maxDays: 8,
			tolerance: 2,
		},
	]

	for (const type of subscriptionTypes) {
		if (averageInterval >= type.minDays && averageInterval <= type.maxDays) {
			const confidence = Math.max(0, Math.min(1, 1 - standardDeviation / type.tolerance))
			return { frequency: type.frequency, confidence }
		}
	}

	return { frequency: "monthly", confidence: 0 }
}
