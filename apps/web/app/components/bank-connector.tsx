import { useMutation } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { useApi } from "~/lib/api/client"
import { useInstitutions } from "~/utils/electric/hooks"
import { CommandMenu } from "./ui"

export interface BankConnectorProps {
	isOpen: boolean
	setIsOpen: (isOpen: boolean) => void
}

export const BankConnector = ({ isOpen, setIsOpen }: BankConnectorProps) => {
	const { data } = useInstitutions()

	const api = useApi()

	const createLinkTokenMutation = api.useMutation("post", "/gocardless/link", {
		onSuccess: (data) => {
			window.location.href = data.link
		},
	})

	const [selectedCountry, setSelectedCountry] = useState<string>()

	const uniqueCountries = useMemo(
		() =>
			data.reduce((acc, item) => {
				if (!acc.includes(item.countries[0])) {
					acc.push(item.countries[0])
				}
				return acc
			}, [] as string[]),
		[data],
	)

	const filteredInstitutions = useMemo(() => {
		if (!selectedCountry) {
			return []
		}

		return data.filter((item) => {
			if (selectedCountry) {
				return item.countries.includes(selectedCountry)
			}
			return true
		})
	}, [data, selectedCountry])

	return (
		<CommandMenu isOpen={isOpen} onOpenChange={setIsOpen}>
			<CommandMenu.Input autoFocus placeholder="Quick search..." />
			<CommandMenu.List>
				{!selectedCountry && (
					<CommandMenu.Section heading="Countries">
						{uniqueCountries.map((country) => (
							<CommandMenu.Item asChild key={country}>
								{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
								<div onClick={() => setSelectedCountry(country)}>
									<img
										className="h-3 pr-2"
										src={`https://flagcdn.com/h48/${country.toLowerCase()}.png`}
										alt={country}
									/>{" "}
									{country}
								</div>
							</CommandMenu.Item>
						))}
					</CommandMenu.Section>
				)}
				{selectedCountry && (
					<CommandMenu.Section heading="Banks">
						{filteredInstitutions.map((institution) => (
							<CommandMenu.Item asChild key={institution.id}>
								{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
								<div
									onClick={() =>
										createLinkTokenMutation.mutate({
											body: {
												institutionId: institution.id,
											},
										})
									}
								>
									<img className="h-3 pr-2" src={institution.logo} alt={institution.name} />{" "}
									{institution.name}
								</div>
							</CommandMenu.Item>
						))}
					</CommandMenu.Section>
				)}
			</CommandMenu.List>
		</CommandMenu>
	)
}
