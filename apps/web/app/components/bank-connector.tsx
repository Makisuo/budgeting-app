import { IconPlus } from "justd-icons"
import { useMemo, useState } from "react"
import { useApi } from "~/lib/api/client"
import { useInstitutions } from "~/utils/electric/hooks"
import { Button, ComboBox, Modal, ProgressCircle, TextField } from "./ui"

import { ListBox, ListBoxItem, Text } from "react-aria-components"

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

	const [bankFilter, setBankFilter] = useState<string>("")
	const [selectedCountry, setSelectedCountry] = useState<string>("DE")

	const uniqueCountries = useMemo(() => Array.from(new Set(data.map((item) => item.countries[0]))), [data])

	const mappedCountries = useMemo(() => {
		return uniqueCountries.map((country) => ({
			value: country,
			label: country,
		}))
	}, [uniqueCountries])

	const countryFilteredInstitutions = useMemo(() => {
		if (!selectedCountry) return []

		const countrySet = new Set([selectedCountry])
		return data.filter((item) => item.countries.some((country) => countrySet.has(country)))
	}, [data, selectedCountry])

	const filteredInstitutions = useMemo(() => {
		const baseResults = countryFilteredInstitutions.slice(0, 100)
		if (!bankFilter) return baseResults

		const searchTerm = bankFilter.toLowerCase()

		// Pre-allocate array size for better memory management
		const results = new Array(Math.min(baseResults.length, 100))
		let count = 0

		for (let i = 0; i < baseResults.length && count < 100; i++) {
			if (baseResults[i].name.toLowerCase().includes(searchTerm)) {
				results[count++] = baseResults[i]
			}
		}

		return results.slice(0, count)
	}, [countryFilteredInstitutions, bankFilter])

	return (
		<Modal isOpen={isOpen} onOpenChange={setIsOpen}>
			<Modal.Content>
				<Modal.Header>
					<Modal.Title>Connect bank account</Modal.Title>
					<Modal.Description>
						We work with a variety of banking providers to support as many banks as possible.
					</Modal.Description>
				</Modal.Header>
				<Modal.Body className="space-y-6 pb-4">
					<div className="flex gap-2">
						<TextField
							className="w-full"
							value={bankFilter}
							onChange={setBankFilter}
							placeholder="Search bank"
						/>
						<ComboBox
							className={"w-auto"}
							selectedKey={selectedCountry}
							onSelectionChange={(value) => setSelectedCountry(value?.toString() || "DE")}
						>
							<ComboBox.Input placeholder="Select bank" />
							<ComboBox.List items={mappedCountries}>
								{(item) => (
									<ComboBox.Option id={item.value} textValue={item.label}>
										<img
											className="h-3 pr-2"
											src={`https://flagcdn.com/h48/${item.value.toLowerCase()}.png`}
											alt={item.label}
										/>{" "}
										{item.label}
									</ComboBox.Option>
								)}
							</ComboBox.List>
						</ComboBox>
					</div>
					<ListBox className="flex flex-col gap-4" items={filteredInstitutions}>
						{(institution) => (
							<ListBoxItem className="flex items-center justify-between gap-2 focus:outline-none">
								<div className="flex gap-2">
									{institution.logo && (
										<img
											className="aspect-square size-8 rounded-full"
											src={institution.logo}
											alt={institution.name}
										/>
									)}
									<div className="flex flex-col">
										<Text slot="label" className="text-sm">
											{institution.name}
										</Text>
										<Text slot="description" className="text-muted-fg text-xs">
											GoCardless
										</Text>
									</div>
								</div>
								<Button
									appearance="outline"
									size="small"
									isPending={createLinkTokenMutation.isPending}
									isDisabled={createLinkTokenMutation.isPending}
									onPress={() =>
										createLinkTokenMutation.mutate({
											body: {
												institutionId: institution.id,
											},
										})
									}
								>
									{({ isPending }) => (
										<>
											{isPending ? (
												<ProgressCircle isIndeterminate aria-label="Connecting..." />
											) : (
												<IconPlus />
											)}
											Connect
										</>
									)}
								</Button>
							</ListBoxItem>
						)}
					</ListBox>
				</Modal.Body>
			</Modal.Content>
		</Modal>
	)
}
