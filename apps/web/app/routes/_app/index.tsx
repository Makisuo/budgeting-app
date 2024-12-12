import { createFileRoute } from "@tanstack/react-router"
import type { Account } from "db"
import { useMemo } from "react"
import { Card } from "~/components/ui"
import { useDrizzleLive } from "~/lib/hooks/use-drizzle-live"
import { currencyFormatter } from "~/utils/formatters"

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

function Home() {
	const { data } = useDrizzleLive((db) =>
		db.query.accounts.findMany({
			with: {
				institution: true,
			},
		}),
	)

	const usageData = useMemo(() => {
		return getTotalAggregatedStats(data)
	}, [data])

	console.log(usageData)

	return (
		<div>
			<div className="grid grid-cols-12 gap-3">
				<Card className="col-span-4 space-y-1 p-4">
					<div className="flex items-center gap-2">
						<p className="text-muted-fg text-sm">Total Balance</p>
					</div>
					<div>
						{usageData.balances.map((balance) => (
							<p className="text-xl first:font-semibold first:text-3xl" key={balance.currency}>
								{currencyFormatter(balance.currency).format(balance.balance)}
							</p>
						))}
					</div>
				</Card>
				<Card className="col-span-4 space-y-1 p-4">
					<div className="flex items-center gap-2">
						<p className="text-muted-fg text-sm">Montlhy Expenses</p>
					</div>
					<h3 className="font-semibold text-3xl">1100$</h3>
				</Card>
				<Card className="col-span-4 space-y-1 p-4">
					<div className="flex items-center gap-2">
						<p className="text-muted-fg text-sm">Montlhy Earnings</p>
					</div>
					<h3 className="font-semibold text-3xl">1100$</h3>
				</Card>
			</div>
		</div>
	)
}
