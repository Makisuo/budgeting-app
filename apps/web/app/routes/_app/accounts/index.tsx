import { Link, createFileRoute } from "@tanstack/react-router"
import { Card } from "~/components/ui"
import { useBankAccounts } from "~/utils/electric/hooks"

export const Route = createFileRoute("/_app/accounts/")({
	component: RouteComponent,
})

function RouteComponent() {
	const { data } = useBankAccounts()

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
