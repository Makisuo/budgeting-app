import { Link } from "@tanstack/react-router"
import { useSetAtom } from "jotai"
import { IconCirclePlaceholderDashed } from "justd-icons"
import { DateValue } from "~/components/date-value"
import { Badge } from "~/components/ui"
import { Table } from "~/components/ui/html-table"
import { currencyFormatter } from "~/utils/formatters"
import { useDrizzleLive } from "~/utils/pglite/drizzle-client"
import { StatusBadge } from "./status-badge"
import { TransactionAside, transactionAsideAtom } from "./transaction-aside"

export const TransactionTable = ({
	accountId,
	filter,
}: {
	accountId: string
	filter?: {
		transactionName?: string
		companyId?: string
		categoryId?: string
	}
}) => {
	const { data: transactions } = useDrizzleLive((db) =>
		db.query.transactions.findMany({
			with: {
				company: true,
				category: true,
			},
			where: (table, { eq, and }) =>
				and(
					eq(table.accountId, accountId),
					filter?.companyId ? eq(table.companyId, filter.companyId) : undefined,
					filter?.categoryId ? eq(table.categoryId, filter.categoryId) : undefined,
					filter?.transactionName ? eq(table.name, filter.transactionName) : undefined,
				),
			limit: 100,
			orderBy: (table, { desc }) => desc(table.date),
		}),
	)

	const setDialogData = useSetAtom(transactionAsideAtom)

	return (
		<>
			<Table aria-label="Daemons">
				<Table.Header>
					<Table.Column>Name</Table.Column>
					<Table.Column>Price</Table.Column>
					<Table.Column>Category</Table.Column>
					<Table.Column>Date</Table.Column>
					<Table.Column>Status</Table.Column>
				</Table.Header>
				{transactions.map((transaction) => (
					<Table.Row
						key={transaction.id}
						onClick={() => {
							setDialogData({ open: true, transactionId: transaction.id })
						}}
					>
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
							<Link
								onClick={(e) => {
									e.stopPropagation()
								}}
								to="/accounts/$accountId"
								params={{ accountId: transaction.accountId }}
								search={{ categoryId: transaction.categoryId }}
							>
								<Badge>{transaction.category.name}</Badge>
							</Link>
						</Table.Cell>
						<Table.Cell>
							<DateValue date={transaction.date} />
						</Table.Cell>
						<Table.Cell>
							<StatusBadge status={transaction.status} />
						</Table.Cell>
					</Table.Row>
				))}
			</Table>
			<TransactionAside />
		</>
	)
}
