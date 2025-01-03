import { createFileRoute } from "@tanstack/react-router"
import { AccountCard } from "~/components/account-card"
import { useDrizzleLive } from "~/utils/pglite/drizzle-client"

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

	return (
		<div>
			<div className="flex flex-row gap-2">
				{data.map((item) => (
					<AccountCard key={item.id} account={item} />
				))}
			</div>
		</div>
	)
}
