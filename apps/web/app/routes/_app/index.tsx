import { createFileRoute } from "@tanstack/react-router"
import { Card } from "~/components/ui"

import { Button } from "~/components/ui/button"
import { useBankAccounts } from "~/utils/electric/hooks"

export const Route = createFileRoute("/_app/")({
	component: Home,
})

function Home() {
	const { auth } = Route.useRouteContext()

	const { data } = useBankAccounts()

	const syncBankAccount = async () => {
		const res = await fetch("http://localhost:8787/sync-bank-accounts", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${auth.session.id}`,
			},
		})

		console.info(res)
	}

	return (
		<div>
			<Button onPress={syncBankAccount}>Sync Bank Accounts</Button>
			<Card>
				<Card.Header>
					<Card.Title>Monthly Report</Card.Title>
					<Card.Description>Financial summary for June</Card.Description>
				</Card.Header>
				<Card.Content>WOW</Card.Content>
				<Card.Footer>
					<Button>View Details</Button>
				</Card.Footer>
			</Card>
		</div>
	)
}
