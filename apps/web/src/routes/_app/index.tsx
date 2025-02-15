import { createFileRoute } from "@tanstack/react-router"
import { type } from "arktype"
import { MonthlyIntervalCharts } from "./-components/monthly-interval-charts"
import { MonthlyStats } from "./-components/montlhy-stats"
import { TransactionCalendarOverview } from "./-components/transaction-calendar-overview"

const searchParams = type({ "date?": "number", "view?": "'all' | 'expenses' | 'income'" })

export const Route = createFileRoute("/_app/")({
	component: Home,
	validateSearch: searchParams,
})

function Home() {
	return (
		<div className="space-y-6">
			<MonthlyStats />

			<TransactionCalendarOverview />

			<MonthlyIntervalCharts />
		</div>
	)
}
