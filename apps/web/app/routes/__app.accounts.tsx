import { Link, createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/start"
import { Card } from "~/components/ui"
import { db } from "~/utils/db"
import { getBankAccounts } from "./__app"
import { fetchUserSession } from "./__root"

export const Route = createFileRoute("/__app/accounts")({
	component: RouteComponent,
	loader: async () => {
		const bankAccounts = await getBankAccounts()
		return {
			bankAccounts,
		}
	},
})

function RouteComponent() {
	const { bankAccounts } = Route.useLoaderData()

	return (
		<div>
			<div className="flex flex-row gap-2">
				{bankAccounts.map((item) => (
					<Link key={item.id} to={"/accounts/$id"} params={{ id: item.id }}>
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
