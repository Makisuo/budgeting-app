import { createFileRoute, notFound } from "@tanstack/react-router"
import { IconCirclePlaceholderDashed } from "justd-icons"
import { getBankAccount } from "~/actions"
import { Card } from "~/components/ui"
import { Badge } from "~/components/ui/badge"
import { Table } from "~/components/ui/table"
import { useTransactions } from "~/utils/electric/hooks"

export const Route = createFileRoute("/_app/accounts/$accountId")({
	component: RouteComponent,
	loader: async ({ params }) => {
		const bankAccount = await getBankAccount({ data: params.accountId })

		if (!bankAccount) {
			throw notFound()
		}

		return {
			bankAccount,
		}
	},
})

function RouteComponent() {
	const { bankAccount } = Route.useLoaderData()

	const { data: transactions } = useTransactions()

	return (
		<div className="space-y-4">
			<Card>
				<Card.Header>
					<div>
						<Card.Title>{bankAccount.name}</Card.Title>
					</div>
				</Card.Header>
				<Card.Content>{bankAccount.balance.available}</Card.Content>
			</Card>

			<Card>
				<Card.Header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
					<div>
						<Card.Title>Transactions</Card.Title>
					</div>
				</Card.Header>
				<Card.Content>
					<Table aria-label="Daemons">
						<Table.Header>
							<Table.Column isRowHeader>Name</Table.Column>
							<Table.Column>Price</Table.Column>
							<Table.Column>Date</Table.Column>
							<Table.Column>Status</Table.Column>
						</Table.Header>
						<Table.Body>
							{transactions.map((transaction) => (
								<Table.Row key={transaction.id}>
									<Table.Cell className="flex items-center gap-2">
										{transaction.logo_url ? (
											<img className="size-6" src={transaction.logo_url} alt={transaction.name} />
										) : (
											<IconCirclePlaceholderDashed className="size-6" />
										)}
										{transaction.name}
									</Table.Cell>
									<Table.Cell>{transaction.amount}</Table.Cell>
									<Table.Cell>{transaction.date}</Table.Cell>
									<Table.Cell>
										<Badge intent={transaction.pending ? "info" : "primary"}>
											{transaction.pending ? "Pending" : "Completed"}
										</Badge>
									</Table.Cell>
								</Table.Row>
							))}
						</Table.Body>
					</Table>
				</Card.Content>
			</Card>
		</div>
	)
}
