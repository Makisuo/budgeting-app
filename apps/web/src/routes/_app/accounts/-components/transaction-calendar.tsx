import { schema } from "db"
import { isNull, sql } from "drizzle-orm"
import { startTransition, useState } from "react"
import type { DateValue } from "react-aria-components"
import { Calendar, Card, Toggle, ToggleGroup } from "~/components/ui"
import { useDrizzleLive } from "~/utils/pglite/drizzle-client"

export const TransactionCalendar = ({
	onChange,
	onViewChange,
	value,
}: {
	onChange?: (value: DateValue) => void
	value?: DateValue
	onViewChange?: (view: "all" | "income" | "expenses") => void
}) => {
	const { data } = useDrizzleLive((db) =>
		db
			.select({
				day: sql<Date>`DATE_TRUNC('day', ${schema.transactions.date})::date`.as("day"),
				income: sql<number>`SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END)`.as("income"),
				expenses: sql<number>`SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END)`.as("expenses"),
			})
			.from(schema.transactions)
			.where(isNull(schema.transactions.directTransfer))
			.groupBy(sql`DATE_TRUNC('day', ${schema.transactions.date})`)
			.orderBy(sql`DATE_TRUNC('day', ${schema.transactions.date})`),
	)

	const [type, setType] = useState<"all" | "income" | "expenses">("income")

	return (
		<Card className="max-w-[430px] lg:w-full">
			<Card.Header>
				<div className="flex justify-between">
					<Card.Title>Calendar</Card.Title>
					<ToggleGroup
						intent="outline"
						selectedKeys={[type]}
						onSelectionChange={(keys) => {
							const key = [...keys][0]?.toString() ?? null

							startTransition(() => {
								setType(key as "income" | "expenses")
								onViewChange?.(key as "income" | "expenses")
							})
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
				<Calendar
					aria-label="Transaction Calendar"
					value={value}
					onChange={onChange}
					transactionsData={data}
					type={type}
				/>
			</div>
		</Card>
	)
}
