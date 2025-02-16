import { schema } from "db"
import { and, count, isNull, sql } from "drizzle-orm"
import { useAtom } from "jotai/react"
import { useMemo } from "react"
import { PrivateValue } from "~/components/private-value"
import { Card } from "~/components/ui"
import { exchangeRateAtom } from "~/lib/exchange-rate"
import { currencyFormatter } from "~/utils/formatters"
import { useDrizzleLive } from "~/utils/pglite/drizzle-client"
import { generalSettingsAtom } from "../settings"

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
			.where(
				and(
					sql`${schema.transactions.date} > NOW() - INTERVAL '1 months'`,
					isNull(schema.transactions.directTransfer),
				),
			),
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

	const [exchangeRates] = useAtom(exchangeRateAtom)
	const [settings] = useAtom(generalSettingsAtom)

	const amountOfTransactions = useMemo(() => {
		return data.reduce((acc, curr) => acc + curr.transactionCount, 0)
	}, [data])

	const totalBalance = aggregatedAccountBalance.reduce((acc, curr) => {
		if (exchangeRates.base.toUpperCase() === curr.currency.toUpperCase()) {
			return acc + curr.balance
		}
		return acc + curr.balance * exchangeRates.rates[curr.currency.toUpperCase()]
	}, 0)

	const totalEarnings = data.reduce((acc, curr) => {
		if (exchangeRates.base.toUpperCase() === curr.currency.toUpperCase()) {
			return acc + curr.income
		}
		return acc + curr.income * exchangeRates.rates[curr.currency.toUpperCase()]
	}, 0)

	const totalExpenses = data.reduce((acc, curr) => {
		if (exchangeRates.base.toUpperCase() === curr.currency.toUpperCase()) {
			return acc + curr.expenses
		}
		return acc + curr.expenses * exchangeRates.rates[curr.currency.toUpperCase()]
	}, 0)

	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
			<Card className="space-y-1">
				<Card.Header>
					<Card.Description>Total Balance</Card.Description>
					<p className="font-semibold text-3xl">
						<PrivateValue>{currencyFormatter(settings.currency).format(totalBalance)}</PrivateValue>
					</p>
				</Card.Header>
			</Card>
			<Card className="space-y-1">
				<Card.Header>
					<Card.Description>Monthly Expenses</Card.Description>
					<p className="font-semibold text-3xl">
						<PrivateValue>
							{currencyFormatter(settings.currency).format(Math.abs(totalExpenses))}
						</PrivateValue>
					</p>
				</Card.Header>
			</Card>
			<Card className="space-y-1">
				<Card.Header>
					<Card.Description>Monthly Earnings</Card.Description>
					<p className="font-semibold text-3xl">
						<PrivateValue>
							{currencyFormatter(settings.currency).format(Math.abs(totalEarnings))}
						</PrivateValue>
					</p>
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
