import { createFileRoute } from "@tanstack/react-router"
import { format } from "date-fns"
import { TransactionTable } from "~/components/transaction-table"
import { Card } from "~/components/ui"
import { useDrizzleLive } from "~/lib/hooks/use-drizzle-live"
import { currencyFormatter } from "~/utils/formatters"

export const Route = createFileRoute("/_app/accounts/$accountId")({
	component: RouteComponent,
})

function RouteComponent() {
	const { accountId } = Route.useParams()

	const { data: bankAccount } = useDrizzleLive((db) =>
		db.query.accounts.findFirst({
			where: (table, { eq }) => eq(table.id, accountId),
		}),
	)

	if (!bankAccount) {
		return <div>Account not found</div>
	}

	return (
		<div className="space-y-4">
			<Card>
				<Card.Header>
					<div>
						<Card.Title>{bankAccount.name}</Card.Title>
						<Card.Description>
							Last Sync{" "}
							{bankAccount.lastSync ? format(bankAccount.lastSync, "dd/MM/yyyy HH:mm") : "Never"}
						</Card.Description>
					</div>
				</Card.Header>
				<Card.Content>
					{currencyFormatter(bankAccount.balanceCurrency ?? "USD").format(
						Number(bankAccount.balanceAmount) ?? 0,
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
					<TransactionTable accountId={accountId} />
				</Card.Content>
			</Card>
		</div>
	)
}
