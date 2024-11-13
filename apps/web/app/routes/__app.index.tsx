import { Link, createFileRoute } from "@tanstack/react-router"

import { Card, Container } from "~/components/ui"
import { Button } from "~/components/ui/button"
import { getBankAccounts } from "./__app"

export const Route = createFileRoute("/__app/")({
	component: Home,
	loader: async ({ context }) => {
		// TODO: Shouldnt pass userId here, insecure
		const bankAccounts = await getBankAccounts()
		return {
			bankAccounts,
		}
	},
})

function Home() {
	const { auth } = Route.useRouteContext()
	const { bankAccounts } = Route.useLoaderData()

	const syncBankAccount = async () => {
		const res = await fetch("http://localhost:8787/sync-bank-accounts", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${auth.session.id}`,
			},
		})

		console.log(res)
	}

	return (
		<Container>
			<div className="flex gap-2">
				<Button onPress={syncBankAccount}>Sync Bank Accounts</Button>
			</div>

			<div className="flex flex-row gap-2">
				{bankAccounts.map((item) => (
					<Link key={item.id} to={"/$id"} params={{ id: item.id }}>
						<Card>
							<Card.Header>Plaid Items</Card.Header>
							<Card.Content>{item.name}</Card.Content>
						</Card>
					</Link>
				))}
			</div>
		</Container>
	)
}
