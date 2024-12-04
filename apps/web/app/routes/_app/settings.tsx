import { createFileRoute } from "@tanstack/react-router"
import { Card, Container } from "~/components/ui"

export const Route = createFileRoute("/_app/settings")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<>
			<Card>
				<Card.Header>
					<Card.Title>Themes</Card.Title>
					<Card.Description>Change the theme of the app</Card.Description>
				</Card.Header>
			</Card>
		</>
	)
}
