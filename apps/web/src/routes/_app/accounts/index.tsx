import { Link, createFileRoute } from "@tanstack/react-router"
import { IconPlus } from "justd-icons"
import { useState } from "react"
import { BankConnector } from "~/components/bank-connector"
import { Button, Card } from "~/components/ui"
import { useDrizzleLive } from "~/utils/pglite/drizzle-client"
import { AccountCard } from "./-components/account-card"

export const Route = createFileRoute("/_app/accounts/")({
	component: RouteComponent,
})

function RouteComponent() {
	const { data } = useDrizzleLive((db) =>
		db.query.accounts.findMany({
			with: {
				institution: true,
				transactions: {
					where: (table, { sql }) => sql`${table.date} > NOW() - INTERVAL '14 days'`,
				},
			},
		}),
	)

	const [isOpen, setIsOpen] = useState(false)

	if (data.length === 0) {
		return (
			<Card className="border-dotted">
				<Card.Header
					title="No connected accounts found"
					description="Connect your first account to get started"
				/>
				<Card.Footer>
					<Button onPress={() => setIsOpen((open) => !open)}>
						<IconPlus />
						Connect New Bank Account
					</Button>
					<BankConnector isOpen={isOpen} setIsOpen={setIsOpen} />
				</Card.Footer>
			</Card>
		)
	}

	return (
		<div>
			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
				{data.map((item) => (
					<AccountCard key={item.id} account={item} />
				))}
			</div>
		</div>
	)
}
