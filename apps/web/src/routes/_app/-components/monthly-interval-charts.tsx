import { capitalizeFirstLetter } from "better-auth/react"
import { schema } from "db"
import { sql } from "drizzle-orm"
import { Card } from "~/components/ui"
import { BarChart } from "~/components/ui/bar-chart"
import { compactCurrencyFormatter } from "~/utils/formatters"
import { useDrizzleLive } from "~/utils/pglite/drizzle-client"

interface GroupedTransaction {
	month: Date
	[key: string]: number | Date // e.g., eurExpenses, usdExpenses, eurIncome, usdIncome
}

interface GroupedResult {
	transactions: GroupedTransaction[]
	currencies: string[]
}

function groupTransactionsByDate(
	transactions: {
		month: Date
		income: number
		expenses: number
		currency: string
	}[],
): GroupedResult {
	const currencies = new Set<string>()

	const groupedMap = transactions.reduce((acc, transaction) => {
		const dateStr = transaction.month.toISOString().split("T")[0]
		const currencyLower = transaction.currency.toLowerCase()
		currencies.add(currencyLower)

		if (!acc.has(dateStr)) {
			acc.set(dateStr, {
				month: transaction.month,
			})
		}

		const group = acc.get(dateStr)!

		// Add expenses
		const expenseKey = `${currencyLower}Expenses`
		group[expenseKey] = ((group[expenseKey] as number) || 0) + transaction.expenses

		// Add income
		const incomeKey = `${currencyLower}Income`
		group[incomeKey] = ((group[incomeKey] as number) || 0) + transaction.income

		return acc
	}, new Map<string, GroupedTransaction>())

	return {
		transactions: Array.from(groupedMap.values()),
		currencies: Array.from(currencies),
	}
}

const getDateRange = (transactions: GroupedTransaction[]): string => {
	if (!transactions.length) return ""

	// Sort transactions by date
	const sortedTransactions = [...transactions].sort((a, b) => a.month.getTime() - b.month.getTime())

	const startDate = sortedTransactions[0].month
	const endDate = sortedTransactions[sortedTransactions.length - 1].month

	// Format dates to "MMM YYYY"
	const formatDate = (date: Date): string => {
		return date.toLocaleDateString("en-US", {
			month: "short",
			year: "numeric",
		})
	}

	return `${formatDate(startDate)} - ${formatDate(endDate)}`
}

export const MonthlyIntervalCharts = () => {
	const { data: monthlyTransactionData } = useDrizzleLive((db) =>
		db
			.select({
				month: sql<Date>`DATE_TRUNC('month', ${schema.transactions.date})::date`.as("month"),
				income: sql<number>`SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END)`.as("income"),
				expenses: sql<number>`SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END)`.as("expenses"),
				currency: schema.transactions.currency,
			})
			.from(schema.transactions)
			.groupBy(schema.transactions.currency, sql`DATE_TRUNC('month', ${schema.transactions.date})`)
			.where(sql`${schema.transactions.date} > NOW() - INTERVAL '6 months'`)
			.orderBy(sql`DATE_TRUNC('month', ${schema.transactions.date})`),
	)

	const groupedTransactions = groupTransactionsByDate(monthlyTransactionData)

	const dateRange = getDateRange(groupedTransactions.transactions)

	return (
		<div className="grid w-full grid-cols-12 gap-3">
			<Card className="col-span-12 md:col-span-6 xl:col-span-6">
				<Card.Header>
					<Card.Title>Monthly Earnings</Card.Title>
					<Card.Description>{dateRange}</Card.Description>
				</Card.Header>
				<BarChart
					config={Object.fromEntries(
						groupedTransactions.currencies.map((currency) => [
							`${currency}Income`,
							{
								label: `${capitalizeFirstLetter(currency)} Earnings`,
								color: "var(--success)",
							},
						]),
					)}
					xAxisProps={{
						tickFormatter(value, index) {
							return new Intl.DateTimeFormat("en", { month: "short" }).format(new Date(value))
						},
					}}
					valueFormatter={(value) => compactCurrencyFormatter("usd").format(value)}
					className="h-[400px] w-full"
					data={groupedTransactions.transactions}
					dataKey={"month"}
					legend={false}
				/>
			</Card>
			<Card className="col-span-12 md:col-span-6 xl:col-span-6">
				<Card.Header>
					<Card.Title>Monthly Expenses</Card.Title>
					<Card.Description>{dateRange}</Card.Description>
				</Card.Header>
				<BarChart
					legend={false}
					layout="vertical"
					yAxisProps={{
						tickFormatter(value, index) {
							return new Intl.DateTimeFormat("en", { month: "short" }).format(new Date(value))
						},
					}}
					config={Object.fromEntries(
						groupedTransactions.currencies.map((currency) => [
							`${currency}Expenses`,
							{
								label: `${currency} Expenses`,
								color: "var(--danger)",
							},
						]),
					)}
					className="h-[400px] w-full"
					data={groupedTransactions.transactions}
					dataKey={"month"}
				/>
			</Card>
		</div>
	)
}
