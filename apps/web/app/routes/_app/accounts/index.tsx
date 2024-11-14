import { Link, createFileRoute } from "@tanstack/react-router"
import { Card } from "~/components/ui"
import { useBankAccounts } from "~/utils/electric/hooks"
import { getBankAccounts } from "../../_app"

export const Route = createFileRoute("/_app/accounts/")({
	component: RouteComponent,
	loader: async () => {
		const bankAccounts = await getBankAccounts()
		return {
			bankAccounts,
		}
	},
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
