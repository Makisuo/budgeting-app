import { fromAbsolute, getLocalTimeZone, today } from "@internationalized/date"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { endOfDay, startOfDay } from "date-fns"
import { IconCirclePlaceholderDashed } from "justd-icons"
import { PrivateValue } from "~/components/private-value"
import { Badge, Card } from "~/components/ui"
import { currencyFormatter } from "~/utils/formatters"
import { useDrizzleLive } from "~/utils/pglite/drizzle-client"
import { TransactionCalendar } from "../accounts/-components/transaction-calendar"

export const TransactionCalendarOverview = () => {
	const navigate = useNavigate()

	const search = useSearch({ from: "/_app/" })

	return (
		<div className="flex flex-col gap-3 lg:flex-row">
			<TransactionCalendar
				onChange={(value) =>
					navigate({
						to: "/",
						search: {
							...search,
							date: value.toDate(getLocalTimeZone()).getTime(),
						},
					})
				}
				onViewChange={(view) =>
					navigate({
						to: "/",
						search: {
							...search,
							view: view,
						},
					})
				}
				value={search.date ? fromAbsolute(search.date, getLocalTimeZone()) : undefined}
			/>
			<TransCard />
		</div>
	)
}

const TransCard = () => {
	const search = useSearch({ from: "/_app/" })

	const date = search.date ? new Date(search.date) : new Date()

	const { data } = useDrizzleLive((db) =>
		db.query.transactions.findMany({
			where: (table, { and, gte, lt }) =>
				and(
					gte(table.date, startOfDay(date)),
					lt(table.date, endOfDay(date)),
					search.view === "expenses" ? lt(table.amount, 0) : undefined,
					search.view === "income" ? gte(table.amount, 0) : undefined,
				),
			with: {
				company: true,
			},
		}),
	)

	return (
		<Card className="w-full">
			<Card.Header
				title="Transactions"
				description={new Intl.DateTimeFormat("en-US", {
					month: "long",
					day: "numeric",
					year: "numeric",
				}).format(date)}
			/>
			<Card.Content className="flex max-h-[350px] flex-col gap-0.5 overflow-y-auto">
				{data.map((transaction) => (
					<Link
						to="/accounts/$accountId"
						params={{
							accountId: transaction.accountId,
						}}
						className="flex flex-nowrap gap-2 rounded-md p-3 hover:bg-muted"
						key={transaction.id}
					>
						{transaction.company ? (
							<img
								className="size-6 rounded-md"
								src={`https://cdn.brandfetch.io/${transaction.company.url}/w/512/h/512?c=1id0IQ-4i8Z46-n-DfQ`}
								alt={transaction.company.name}
							/>
						) : (
							<IconCirclePlaceholderDashed className="size-6" />
						)}

						<p>{transaction.company?.name || transaction.name}</p>

						<Badge intent={Number(transaction.amount) < 0 ? "danger" : "success"}>
							<PrivateValue>
								{currencyFormatter(transaction.currency ?? "USD").format(transaction.amount)}
							</PrivateValue>
						</Badge>
					</Link>
				))}
			</Card.Content>
		</Card>
	)
}
