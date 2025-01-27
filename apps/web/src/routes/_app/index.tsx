import { createFileRoute } from "@tanstack/react-router"
import { capitalizeFirstLetter } from "better-auth/react"
import { schema } from "db"
import { sql } from "drizzle-orm"
import { Card } from "~/components/ui"
import { BarChart } from "~/components/ui/bar-chart"
import { compactCurrencyFormatter, currencyFormatter } from "~/utils/formatters"
import { useDrizzleLive } from "~/utils/pglite/drizzle-client"
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
