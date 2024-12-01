import { IconPlus } from "justd-icons"
import { useMemo, useState } from "react"
import { useApi } from "~/lib/api/client"
import { useInstitutions } from "~/utils/electric/hooks"
import { Button, ComboBox, Modal, ProgressCircle, TextField } from "./ui"

import { VList } from "virtua"

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

	const mappedCountries = useMemo(() => {
		return uniqueCountries.map((country) => ({
			value: country,
			label: country,
		}))
	}, [uniqueCountries])

	const countryFilteredInstitutions = useMemo(() => {
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

	const filteredInstitutions = useMemo(() => {
		if (!bankFilter) {
			return countryFilteredInstitutions
		}

		return countryFilteredInstitutions.filter((institution) => {
			return institution.name.toLowerCase().includes(bankFilter.toLowerCase())
		})
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
				<Modal.Body className="space-y-6">
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
					<div className="flex flex-col gap-4">
						{filteredInstitutions.map((institution) => (
							<div key={institution.id} className="flex items-center justify-between gap-2">
								<div className="flex gap-2">
									{institution.logo && (
										<img
											className="aspect-square size-8 rounded-full"
											src={institution.logo}
											alt={institution.name}
										/>
									)}
									<div>
										<p className="text-sm">{institution.name}</p>
										<p className="text-muted-fg text-xs">GoCardless</p>
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
							</div>
						))}
					</div>
				</Modal.Body>
			</Modal.Content>
		</Modal>
	)
}
