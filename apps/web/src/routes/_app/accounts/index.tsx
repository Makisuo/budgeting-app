import { Link, createFileRoute } from "@tanstack/react-router"
import { IconPlus, IconX } from "justd-icons"
import { useState } from "react"
import { BankConnector } from "~/components/bank-connector"
import { Button, Card, buttonStyles } from "~/components/ui"
import { useDrizzleLive } from "~/utils/pglite/drizzle-client"
import { AccountCard } from "./-components/account-card"
import { TransactionTable } from "./-components/transaction-table"
import { searchParams } from "./-utils/table-utils"

export const Route = createFileRoute("/_app/accounts/")({
	component: RouteComponent,
	validateSearch: searchParams,
})

function RouteComponent() {
	const { company, transactionName, categoryId } = Route.useSearch()

	const hasSearchParams = !!company || !!transactionName || !!categoryId

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
		<>
			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
				{data.map((item) => (
					<AccountCard key={item.id} account={item} />
				))}
			</div>
			<div className="flex justify-end">
				{hasSearchParams && (
					<Link
						className={buttonStyles({
							intent: "outline",
							size: "small",
						})}
						to="/accounts"
					>
						<IconX /> Reset Filters
					</Link>
				)}
			</div>
			<Card>
				<Card.Header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
					<div>
						<Card.Title>Transactions</Card.Title>
					</div>
				</Card.Header>
				<Card.Content>
					<TransactionTable
						filter={{
							companyId: company,
							transactionName: transactionName,
							categoryId: categoryId,
						}}
					/>
				</Card.Content>
			</Card>
		</>
	)
}
