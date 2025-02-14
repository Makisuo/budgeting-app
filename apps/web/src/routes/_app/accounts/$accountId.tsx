import { Link, createFileRoute } from "@tanstack/react-router"
import { IconX } from "justd-icons"
import { Card, Note, buttonStyles } from "~/components/ui"
import { useDrizzleLive } from "~/utils/pglite/drizzle-client"
import { AccountCard } from "./-components/account-card"
import { TransactionTable } from "./-components/transaction-table"
import { searchParams } from "./-utils/table-utils"

export const Route = createFileRoute("/_app/accounts/$accountId")({
	component: RouteComponent,
	validateSearch: searchParams,
	errorComponent: (props) => <Note intent="danger">There was an error: {props.error.message}</Note>,
})

function RouteComponent() {
	const { accountId } = Route.useParams()
	const { company, transactionName, categoryId } = Route.useSearch()

	const hasSearchParams = !!company || !!transactionName || !!categoryId

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
		<>
			<AccountCard className="sm:max-w-[300px]" account={bankAccount} compact />

			<div className="flex justify-end">
				{hasSearchParams && (
					<Link
						className={buttonStyles({
							appearance: "outline",
							size: "small",
						})}
						to="/accounts/$accountId"
						params={{ accountId: accountId }}
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
						filter={{ companyId: company, transactionName: transactionName, categoryId, accountId }}
					/>
				</Card.Content>
			</Card>
		</>
	)
}
