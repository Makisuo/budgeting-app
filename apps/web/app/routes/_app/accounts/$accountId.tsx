import { createFileRoute } from "@tanstack/react-router"
import { AccountCard } from "~/components/account-card"
import { TransactionTable } from "~/components/transaction-table"
import { Card } from "~/components/ui"
import { useDrizzleLive } from "~/lib/hooks/use-drizzle-live"

export const Route = createFileRoute("/_app/accounts/$accountId")({
	component: RouteComponent,
})

function RouteComponent() {
	const { accountId } = Route.useParams()

	const { data: bankAccount } = useDrizzleLive((db) =>
		db.query.accounts.findFirst({
			where: (table, { eq }) => eq(table.id, accountId),
			with: {
				institution: true,
				transactions: {
					where: (table, { sql }) => sql`${table.date} > NOW() - INTERVAL '14 days'`,
				},
			},
		}),
	)

	if (!bankAccount) {
		return <div>Account not found</div>
	}

	return (
		<div className="space-y-4">
			<AccountCard className="max-w-[300px]" account={bankAccount} compact />

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
