import { createFileRoute } from "@tanstack/react-router"

import { useTheme } from "~/components/theme-provider"
import { Button, Card, Select } from "~/components/ui"
import { Checkbox } from "~/components/ui/checkbox"

import { useAtom } from "jotai/react"
import { atomWithStorage } from "jotai/utils"
import { usePrivacyMode } from "~/lib/global-store"

export const catModeAtom = atomWithStorage("catMode", false)

export const generalSettingsAtom = atomWithStorage("generalSettings", {
	currency: "USD",
})

export const Route = createFileRoute("/_app/settings")({
	component: RouteComponent,
})

const availableCurrencies = [
	{
		id: "USD",
		name: "US Dollar",
	},
	{
		id: "EUR",
		name: "Euro",
	},
	{
		id: "GBP",
		name: "Pound Sterling",
	},
]

function RouteComponent() {
	const { setTheme } = useTheme()

	const [settings, setSettings] = useAtom(generalSettingsAtom)

	return (
		<>
			<Card>
				<Card.Header>
					<Card.Title>General Settings</Card.Title>
					<Card.Description>Some general settings</Card.Description>
				</Card.Header>
				<Card.Content>
					<div>
						<Select
							selectedKey={settings.currency}
							onSelectionChange={(val) => {
								setSettings((prev) => ({ ...prev, currency: val.toString() }))
							}}
							className="w-max"
						>
							<Select.Trigger />
							<Select.List items={availableCurrencies}>
								{(item) => (
									<Select.Option id={item.id} textValue={item.name}>
										{item.name}
									</Select.Option>
								)}
							</Select.List>
						</Select>
					</div>
				</Card.Content>
			</Card>
			<Card>
				<Card.Header>
					<Card.Title>Themes</Card.Title>
					<Card.Description>Change the theme of the app</Card.Description>
				</Card.Header>
				<Card.Content>
					<Button onPress={() => setTheme("pastel" as "dark")}>Pastel</Button>
				</Card.Content>
			</Card>
			<AppUpdatesCard />
			<CatModeSetting />
			<PrivacyMode />
		</>
	)
}

const AppUpdatesCard = () => {
	// Only show in Tauri environment
	if (typeof window !== "undefined" && typeof window.__TAURI__ === "undefined") {
		return null
	}

	return (
		<Card>
			<Card.Header>
				<Card.Title>App Updates</Card.Title>
				<Card.Description>Check for and install app updates</Card.Description>
			</Card.Header>
		</Card>
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
		</Card>
	)
}

const PrivacyMode = () => {
	const [privacyMode, setPrivacyMode] = usePrivacyMode()
	return (
		<Card>
			<Card.Header>
				<Card.Title>Privacy Mode</Card.Title>
				<Card.Description>Privacy Mode</Card.Description>
			</Card.Header>
			<Card.Content>
				<Checkbox isSelected={privacyMode} onChange={setPrivacyMode}>
					Enable Privacy Mode
				</Checkbox>
			</Card.Content>
		</Card>
	)
}
