import { createFileRoute } from "@tanstack/react-router"
import { Card } from "~/components/ui"

import { Button } from "~/components/ui/button"

export const Route = createFileRoute("/_app/")({
	component: Home,
})

function Home() {
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
