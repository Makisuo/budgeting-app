import { schema } from "db"
import { sql, sum } from "drizzle-orm"
import { useState } from "react"
import { Calendar, Card, Toggle, ToggleGroup } from "~/components/ui"
import { useDrizzleLive } from "~/utils/pglite/drizzle-client"

export const TransactionCalendar = () => {
	const { data } = useDrizzleLive((db) =>
		db
			.select({
				day: sql<Date>`DATE_TRUNC('day', ${schema.transactions.date})::date`.as("day"),
				income: sql<number>`SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END)`.as("income"),
				expenses: sql<number>`SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END)`.as("expenses"),
			})
			.from(schema.transactions)
			.groupBy(sql`DATE_TRUNC('day', ${schema.transactions.date})`)
			.orderBy(sql`DATE_TRUNC('day', ${schema.transactions.date})`),
	)

	const [type, setType] = useState<"all" | "income" | "expenses">("income")

	return (
		<Card className="max-w-[430px]">
			<Card.Header>
				<div className="flex justify-between">
					<Card.Title>Calendar</Card.Title>
					<ToggleGroup
						appearance="outline"
						selectedKeys={[type]}
						onSelectionChange={(keys) => {
							const key = [...keys][0]?.toString() ?? null

							setType(key as "income" | "expenses")
						}}
						selectionMode="single"
					>
						<Toggle id="all">All</Toggle>
						<Toggle id="income">Income</Toggle>
						<Toggle id="expenses">Expenses</Toggle>
					</ToggleGroup>
				</div>
			</Card.Header>
			<div className="px-3 py-2">
				<Calendar aria-label="Event date" transactionsData={data} type={type} />
			</div>
		</Card>
	)
}
