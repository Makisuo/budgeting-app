import { createFileRoute } from "@tanstack/react-router"

import { useTheme } from "~/components/theme-provider"
import { Button, Card } from "~/components/ui"
import { Checkbox } from "~/components/ui/checkbox"

import { useAtom } from "jotai/react"
import { atomWithStorage } from "jotai/utils"

export const catModeAtom = atomWithStorage("catMode", false)

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
			<CatModeSetting />
		</>
	)
}

const CatModeSetting = () => {
	const [catMode, setCatMode] = useAtom(catModeAtom)

	return (
		<Card>
			<Card.Header>
				<Card.Title>Cat Mode</Card.Title>
				<Card.Description>CAT MODE CAT MODE CAT MODE</Card.Description>
			</Card.Header>
			<Card.Content>
				<Checkbox isSelected={catMode} onChange={setCatMode}>
					Enable Cat Mode
				</Checkbox>
			</Card.Content>
			<Card.Footer />
		</Card>
	)
}
