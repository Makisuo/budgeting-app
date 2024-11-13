import { createFileRoute } from "@tanstack/react-router"

import { type PlaidLinkOptions, usePlaidLink } from "react-plaid-link"

import { Card } from "~/components/ui"
import { Button } from "~/components/ui/button"
import { getBankAccounts } from "./__app"

export const Route = createFileRoute("/__app/")({
	component: Home,
	loader: async ({ context }) => {
		// TODO: Shouldnt pass userId here, insecure
		const bankAccounts = await getBankAccounts(context.auth.user.id)
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
		<div className="p-2">
			<h3>Welcome Home!!!</h3>
			<div className="flex gap-2">
				<Button onPress={syncBankAccount}>Sync Bank Accounts</Button>
			</div>

			<div className="flex flex-row gap-2">
				{bankAccounts.map((item) => (
					<Card key={item.id}>
						<Card.Header>Plaid Items</Card.Header>
						<Card.Content>{item.name}</Card.Content>
					</Card>
				))}
			</div>
		</div>
	)
}
