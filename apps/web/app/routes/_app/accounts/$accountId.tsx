import { usePGlite } from "@electric-sql/pglite-react"
import { createFileRoute } from "@tanstack/react-router"
import { IconCirclePlaceholderDashed } from "justd-icons"
import { Button, Card } from "~/components/ui"
import { Badge } from "~/components/ui/badge"
import { Table } from "~/components/ui/table"
import { useApi } from "~/lib/api/client"
import { useBankAccount, useTransactions } from "~/utils/electric/hooks"
import { currencyFormatter } from "~/utils/formatters"

export const Route = createFileRoute("/_app/accounts/$accountId")({
	component: RouteComponent,
})

function RouteComponent() {
	const { accountId } = Route.useParams()

	const $api = useApi()

	const { data: bankAccount } = useBankAccount(accountId)

	const { data: transactions } = useTransactions(accountId)

	const syncTransactionMutation = $api.useMutation("post", "/gocardless/sync/{accountId}")

	if (!bankAccount) {
		return <div>Account not found</div>
	}

	return (
		<div className="space-y-4">
			<Button onPress={() => syncTransactionMutation.mutate({ params: { path: { accountId: accountId } } })}>
				Sync Transactions
			</Button>
			<Card>
				<Card.Header>
					<div>
						<Card.Title>{bankAccount.name}</Card.Title>
					</div>
				</Card.Header>
				<Card.Content>
					{currencyFormatter(bankAccount.balance_currency ?? "USD").format(
						Number(bankAccount.balance_amount) ?? 0,
					)}
				</Card.Content>
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
							<Table.Column>Category</Table.Column>
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
									<Table.Cell>
										<Badge intent={Number(transaction.amount) < 0 ? "danger" : "success"}>
											{currencyFormatter(transaction.currency ?? "USD").format(
												transaction.amount,
											)}
										</Badge>
									</Table.Cell>
									<Table.Cell>{transaction.category || "Unknown"}</Table.Cell>
									<Table.Cell>{transaction.date}</Table.Cell>
									<Table.Cell>
										<Badge intent={transaction.status === "pending" ? "info" : "primary"}>
											{transaction.status === "pending" ? "Pending" : "Completed"}
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
