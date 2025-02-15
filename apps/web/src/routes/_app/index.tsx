import { createFileRoute } from "@tanstack/react-router"
import { MonthlyIntervalCharts } from "./-components/monthly-interval-charts"
import { MonthlyStats } from "./-components/montlhy-stats"
import { TransactionCalendar } from "./accounts/-components/transaction-calendar"

export const Route = createFileRoute("/_app/")({
	component: Home,
})

function Home() {
	return (
		<div className="space-y-6">
			<MonthlyStats />

			<TransactionCalendar />

			<MonthlyIntervalCharts />
		</div>
	)
}
