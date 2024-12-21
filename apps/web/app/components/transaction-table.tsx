import { IconCirclePlaceholderDashed } from "justd-icons"
import { currencyFormatter } from "~/utils/formatters"
import { useDrizzleLive } from "~/utils/pglite/drizzle-client"
import { DateValue } from "./date-value"
import { Badge } from "./ui/badge"
import { Table } from "./ui/table"

export const TransactionTable = ({ accountId }: { accountId: string }) => {
	const { data: transactions } = useDrizzleLive((db) =>
		db.query.transactions.findMany({
			with: {
				company: true,
				category: true,
			},
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
							{transaction.company ? (
								<img
									className="size-6 rounded-md"
									src={`https://cdn.brandfetch.io/${transaction.company.url}/w/512/h/512?c=1id0IQ-4i8Z46-n-DfQ`}
									alt={transaction.company.name}
								/>
							) : (
								<IconCirclePlaceholderDashed className="size-6" />
							)}

							{transaction.company?.name || transaction.name}
						</Table.Cell>
						<Table.Cell>
							<Badge intent={Number(transaction.amount) < 0 ? "danger" : "success"}>
								{currencyFormatter(transaction.currency ?? "USD").format(transaction.amount)}
							</Badge>
						</Table.Cell>
						<Table.Cell>
							<Badge>{transaction.category.name}</Badge>
						</Table.Cell>
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
