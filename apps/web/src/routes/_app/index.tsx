import { createFileRoute } from "@tanstack/react-router"
import type { Account, Transaction } from "db"
import { useMemo } from "react"
import { Calendar, Card } from "~/components/ui"
import { currencyFormatter } from "~/utils/formatters"
import { useDrizzleLive } from "~/utils/pglite/drizzle-client"

export const Route = createFileRoute("/_app/")({
	component: Home,
})

const getTotalAggregatedStats = (accounts: Account[]) => {
	const totals = accounts.reduce((totals: { [currency: string]: number }, account) => {
		return {
			// biome-ignore lint/performance/noAccumulatingSpread: <explanation>
			...totals,
			[account.balanceCurrency]: (totals[account.balanceCurrency] || 0) + account.balanceAmount,
		}
	}, {})

	return {
		balances: Object.entries(totals)
			.map(([currency, balance]) => ({
				currency,
				balance,
			}))
			.sort((a, b) => b.balance - a.balance),
	}
}

const getMonthlyStats = (accounts: (Account & { transactions: Transaction[] })[]) => {
	const currentDate = new Date()
	const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

	const stats: { [currency: string]: { expenses: number; earnings: number } } = {}

	for (const account of accounts) {
		if (account.transactions) {
			for (const transaction of account.transactions) {
				const transactionDate = new Date(transaction.date)
				if (transactionDate >= firstDayOfMonth) {
					const currency = transaction.currency
					if (!stats[currency]) {
						stats[currency] = { expenses: 0, earnings: 0 }
					}

					const amount = transaction.amount * (transaction.currencyRate ?? 1)
					if (amount < 0) {
						stats[currency].expenses += Math.abs(amount)
					} else {
						stats[currency].earnings += amount
					}
				}
			}
		}
	}

	return Object.entries(stats).map(([currency, { expenses, earnings }]) => ({
		currency,
		expenses,
		earnings,
	}))
}

const getChartData = (accounts: (Account & { transactions: Transaction[] })[]) => {
	const currentDate = new Date()
	const fourteenDaysAgo = new Date(currentDate)
	fourteenDaysAgo.setDate(currentDate.getDate() - 13) // -13 because we want to include today

	// Initialize daily totals for last 14 days
	const dailyData = Array.from({ length: 7 }, (_, i) => {
		const date = new Date(fourteenDaysAgo)
		date.setDate(fourteenDaysAgo.getDate() + i)
		return {
			day: date.getDate(),
			date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
			expenses: 0,
			earnings: 0,
		}
	})

	for (const account of accounts) {
		if (account.transactions) {
			for (const transaction of account.transactions) {
				const transactionDate = new Date(transaction.date)
				if (transactionDate >= fourteenDaysAgo && transactionDate <= currentDate) {
					// Find the matching day in our dailyData array
					const dayIndex = dailyData.findIndex((d) => {
						const date = new Date(fourteenDaysAgo)
						date.setDate(fourteenDaysAgo.getDate() + d.day - dailyData[0].day)
						return date.getDate() === transactionDate.getDate()
					})

					if (dayIndex !== -1) {
						const amount = transaction.amount * (transaction.currencyRate ?? 1)
						if (amount < 0) {
							dailyData[dayIndex].expenses = amount
						} else {
							dailyData[dayIndex].earnings += amount
						}
					}
				}
			}
		}
	}

	return dailyData
}

const getMonthlyTotals = (accounts: (Account & { transactions: Transaction[] })[]) => {
	const currentDate = new Date()
	const startOfYear = new Date(currentDate.getFullYear(), 0, 1)
	const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

	const monthlyData = monthNames.map((month) => ({
		month,
		expenses: 0,
		earnings: 0,
	}))

	for (const account of accounts) {
		if (account.transactions) {
			for (const transaction of account.transactions) {
				const transactionDate = new Date(transaction.date)
				if (transactionDate >= startOfYear) {
					const month = transactionDate.getMonth()
					const amount = transaction.amount * (transaction.currencyRate ?? 1)

					if (amount < 0) {
						monthlyData[month].expenses += amount // Keep negative and accumulate
					} else {
						monthlyData[month].earnings += amount
					}
				}
			}
		}
	}

	// Convert expenses to positive numbers for display
	return monthlyData.slice(0, currentDate.getMonth() + 1).map((data) => ({
		...data,
		expenses: Math.abs(data.expenses),
	}))
}

const getDateRanges = () => {
	const currentDate = new Date()
	const fourteenDaysAgo = new Date(currentDate)
	fourteenDaysAgo.setDate(currentDate.getDate() - 13)
	const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

	return {
		daily: `${fourteenDaysAgo.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
		monthly: `${monthNames[0]} - ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`,
	}
}

function Home() {
	const { data } = useDrizzleLive((db) =>
		db.query.accounts.findMany({
			with: {
				institution: true,
				transactions: true,
			},
		}),
	)

	const usageData = useMemo(() => {
		return getTotalAggregatedStats(data)
	}, [data])

	const monthlyStats = useMemo(() => {
		return getMonthlyStats(data)
	}, [data])

	const chartData = useMemo(() => {
		return getChartData(data)
	}, [data])

	const monthlyTotals = useMemo(() => {
		return getMonthlyTotals(data)
	}, [data])

	const dateRanges = useMemo(() => {
		return getDateRanges()
	}, [])

	const amountOfTransactions = useMemo(() => {
		return data.reduce((acc, curr) => acc + curr.transactions.length, 0)
	}, [data])

	const chartConfig = {
		expenses: {
			label: "Expenses",
			color: "var(--danger)",
		},
		earnings: {
			label: "Earnings",
			color: "var(--success)",
		},
	}

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-12 gap-3">
				<Card className="col-span-3 space-y-1">
					<Card.Header>
						<Card.Description>Total Balance</Card.Description>
						<div>
							{usageData.balances.length > 0
								? usageData.balances.map((balance) => (
										<p
											className="text-xl first:font-semibold first:text-3xl"
											key={balance.currency}
										>
											{currencyFormatter(balance.currency).format(balance.balance)}
										</p>
									))
								: "No data"}
						</div>
					</Card.Header>
				</Card>
				<Card className="col-span-3 space-y-1">
					<Card.Header>
						<Card.Description>Monthly Expenses</Card.Description>
						<div>
							{monthlyStats.length > 0
								? monthlyStats.map((stat) => (
										<p className="text-xl first:font-semibold first:text-3xl" key={stat.currency}>
											{currencyFormatter(stat.currency).format(stat.expenses)}
										</p>
									))
								: "No data"}
						</div>
					</Card.Header>
				</Card>
				<Card className="col-span-3 space-y-1">
					<Card.Header>
						<Card.Description>Monthly Earnings</Card.Description>
						<div>
							{monthlyStats.length > 0
								? monthlyStats.map((stat) => (
										<p className="text-xl first:font-semibold first:text-3xl" key={stat.currency}>
											{currencyFormatter(stat.currency).format(stat.earnings)}
										</p>
									))
								: "No data"}
						</div>
					</Card.Header>
				</Card>
				<Card className="col-span-3 space-y-1">
					<Card.Header>
						<Card.Description>Monthly Transactions</Card.Description>
						<p className="font-semibold text-3xl">{amountOfTransactions}</p>
					</Card.Header>
				</Card>
			</div>

			<Card>
				<Card.Header>
					<Card.Title>Calendar</Card.Title>
				</Card.Header>
				<Card.Content className="p-6">
					<Calendar aria-label="Event date" />
				</Card.Content>
			</Card>

			{/* <div className="grid grid-cols-12 gap-3">
				<Card className="col-span-12 xl:col-span-4">
					<Card.Header>
						<Card.Title>Daily Financial Activity</Card.Title>
						<Card.Description>{dateRanges.daily}</Card.Description>
					</Card.Header>
					<BarChart
						config={chartConfig}
						className="h-[400px] min-h-[400px] w-full"
						legend
						data={chartData}
						dataKey={"date"}
					/>
				</Card>
				<Card className="col-span-12 md:col-span-6 xl:col-span-4">
					<Card.Header>
						<Card.Title>Monthly Earnings</Card.Title>
						<Card.Description>{dateRanges.monthly}</Card.Description>
					</Card.Header>
					<BarChart
						config={{
							earnings: {
								label: "Earnings",
								color: "var(--success)",
							},
						}}
						className="h-[400px] w-full"
						data={monthlyTotals}
						dataKey={"month"}
					/>
				</Card>
				<Card className="col-span-12 md:col-span-6 xl:col-span-4">
					<Card.Header>
						<Card.Title>Monthly Expenses</Card.Title>
						<Card.Description>{dateRanges.monthly}</Card.Description>
					</Card.Header>
					<BarChart
						layout="vertical"
						config={{
							expenses: {
								label: "Expenses",
								color: "var(--danger)",
							},
						}}
						className="h-[400px] w-full"
						data={monthlyTotals}
						dataKey={"month"}
					/>
				</Card>
			</div> */}
		</div>
	)
}
