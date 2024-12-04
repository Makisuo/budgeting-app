import { createFileRoute } from "@tanstack/react-router"
import { useTheme } from "~/components/theme-provider"
import { Button, Card, Container } from "~/components/ui"

export const Route = createFileRoute("/_app/settings")({
	component: RouteComponent,
})

function RouteComponent() {
	const { theme, setTheme } = useTheme()

	return (
		<>
			<Card>
				<Card.Header>
					<Card.Title>Themes</Card.Title>
					<Card.Description>Change the theme of the app</Card.Description>
				</Card.Header>
				<Card.Content>
					<Button onPress={() => setTheme("pastel")}>Pastel</Button>
				</Card.Content>
				<Card.Footer>Footer</Card.Footer>
			</Card>
		</>
	)
}
