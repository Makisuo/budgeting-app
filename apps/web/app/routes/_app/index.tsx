import { useLiveQuery, usePGlite } from "@electric-sql/pglite-react"
import { createFileRoute } from "@tanstack/react-router"
import { Card } from "~/components/ui"

import { Button } from "~/components/ui/button"
import { useBankAccounts } from "~/utils/electric/hooks"

export const Route = createFileRoute("/_app/")({
	component: Home,
})

function Home() {
	const { auth } = Route.useRouteContext()

	const pg = usePGlite()

	const items = useLiveQuery(
		`
		SELECT *
		FROM institutions
	  `,
		[],
	)

	console.log(items, "XD")

	return (
		<div>
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
