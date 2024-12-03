import { Link, createFileRoute } from "@tanstack/react-router"
import { Card } from "~/components/ui"
import { useDrizzleLiveIncremental } from "~/lib/hooks/use-drizzle-live"

export const Route = createFileRoute("/_app/accounts/")({
	component: RouteComponent,
})

function RouteComponent() {
	const { data } = useDrizzleLiveIncremental("id", (db) => db.query.accounts.findMany({}))

	return (
		<div>
			<div className="flex flex-row gap-2">
				{data.map((item) => (
					<Link key={item.id} to={"/accounts/$accountId"} params={{ accountId: item.id }}>
						<Card>
							<Card.Header>Plaid Items</Card.Header>
							<Card.Content>{item.name}</Card.Content>
						</Card>
					</Link>
				))}
			</div>
		</div>
	)
}
