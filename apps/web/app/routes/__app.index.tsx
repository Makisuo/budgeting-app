import { createFileRoute } from "@tanstack/react-router"

import { Button } from "~/components/ui/button"

export const Route = createFileRoute("/__app/")({
	component: Home,
})

function Home() {
	const { auth } = Route.useRouteContext()

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
			<div className="flex gap-2">
				<Button onPress={syncBankAccount}>Sync Bank Accounts</Button>
			</div>
		</div>
	)
}
