import { IconCirclePlaceholderDashed } from "justd-icons"
import { useDrizzleLive } from "~/lib/hooks/use-drizzle-live"
import { currencyFormatter } from "~/utils/formatters"
import { DateValue } from "./date-value"
import { Badge } from "./ui/badge"
import { Table } from "./ui/table"

export const TransactionTable = ({ accountId }: { accountId: string }) => {
	const { data: transactions } = useDrizzleLive((db) =>
		db.query.transactions.findMany({
			where: (table, { eq }) => eq(table.accountId, accountId),
			limit: 100,
			orderBy: (table, { desc }) => desc(table.date),
		}),
	)

	return (
		<Table aria-label="Daemons">
			<Table.Header>
				<Table.Column isRowHeader>Name</Table.Column>
				<Table.Column>Price</Table.Column>
				<Table.Column>Category</Table.Column>
				<Table.Column>Date</Table.Column>
				<Table.Column>Status</Table.Column>
			</Table.Header>
			<Table.Body items={transactions}>
				{(transaction) => (
					<Table.Row key={transaction.id}>
						<Table.Cell className="flex items-center gap-2">
							<IconCirclePlaceholderDashed className="size-6" />
							{transaction.name}
						</Table.Cell>
						<Table.Cell>
							<Badge intent={Number(transaction.amount) < 0 ? "danger" : "success"}>
								{currencyFormatter(transaction.currency ?? "USD").format(transaction.amount)}
							</Badge>
						</Table.Cell>
						<Table.Cell>{transaction.category || "Unknown"}</Table.Cell>
						<Table.Cell>
							<DateValue date={transaction.date} />
						</Table.Cell>
						<Table.Cell>
							<Badge intent={transaction.status === "pending" ? "info" : "primary"}>
								{transaction.status === "pending" ? "Pending" : "Completed"}
							</Badge>
						</Table.Cell>
					</Table.Row>
				)}
			</Table.Body>
		</Table>
	)
}
