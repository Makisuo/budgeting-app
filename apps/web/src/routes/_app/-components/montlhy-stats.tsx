import { schema } from "db"
import { count, sql } from "drizzle-orm"
import { useMemo } from "react"
import { PrivateValue } from "~/components/private-value"
import { Card } from "~/components/ui"
import { currencyFormatter } from "~/utils/formatters"
import { useDrizzleLive } from "~/utils/pglite/drizzle-client"

export const MonthlyStats = () => {
	const { data } = useDrizzleLive((db) =>
		db
			.select({
				income: sql<number>`SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END)`.as("income"),
				expenses: sql<number>`SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END)`.as("expenses"),
				currency: schema.transactions.currency,
				transactionCount: count(schema.transactions.id).as("transactionCount"),
			})
			.from(schema.transactions)
			.groupBy(schema.transactions.currency)
			.where(sql`${schema.transactions.date} > NOW() - INTERVAL '1 months'`),
	)

	const { data: aggregatedAccountBalance } = useDrizzleLive((db) =>
		db
			.select({
				balance: sql<number>`SUM(${schema.accounts.balanceAmount})`.as("balance"),
				currency: sql<string>`${schema.accounts.balanceCurrency}`.as("currency"),
			})
			.from(schema.accounts)
			.groupBy(schema.accounts.balanceCurrency),
	)

	const amountOfTransactions = useMemo(() => {
		return data.reduce((acc, curr) => acc + curr.transactionCount, 0)
	}, [data])

	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
			<Card className="space-y-1">
				<Card.Header>
					<Card.Description>Total Balance</Card.Description>
					<div>
						{aggregatedAccountBalance.length > 0
							? aggregatedAccountBalance
									.sort((a, b) => b.balance - a.balance)
									.map((balance) => (
										<p
											className="text-xl first:font-semibold first:text-3xl"
											key={balance.currency}
										>
											<PrivateValue>
												{currencyFormatter(balance.currency).format(balance.balance)}
											</PrivateValue>
										</p>
									))
							: "No data"}
					</div>
				</Card.Header>
			</Card>
			<Card className="space-y-1">
				<Card.Header>
					<Card.Description>Monthly Expenses</Card.Description>
					<div>
						{data.length > 0
							? data.map((stat) => (
									<p className="text-xl first:font-semibold first:text-3xl" key={stat.currency}>
										<PrivateValue>
											{currencyFormatter(stat.currency).format(Math.abs(stat.expenses))}
										</PrivateValue>
									</p>
								))
							: "No data"}
					</div>
				</Card.Header>
			</Card>
			<Card className="space-y-1">
				<Card.Header>
					<Card.Description>Monthly Earnings</Card.Description>
					<div>
						{data.length > 0
							? data.map((stat) => (
									<p className="text-xl first:font-semibold first:text-3xl" key={stat.currency}>
										<PrivateValue>
											{currencyFormatter(stat.currency).format(stat.income)}
										</PrivateValue>
									</p>
								))
							: "No data"}
					</div>
				</Card.Header>
			</Card>
			<Card className="space-y-1">
				<Card.Header>
					<Card.Description>Monthly Transactions</Card.Description>
					<p className="font-semibold text-3xl">{amountOfTransactions}</p>
				</Card.Header>
			</Card>
		</div>
	)
}
