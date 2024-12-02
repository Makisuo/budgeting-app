import { IconPlus } from "justd-icons"
import { useMemo, useState } from "react"
import { useApi } from "~/lib/api/client"
import { Button, ComboBox, Modal, ProgressCircle, TextField } from "./ui"

import { useLiveQuery } from "@electric-sql/pglite-react"
import { schema } from "db"
import { sql } from "drizzle-orm"
import { ListBox, ListBoxItem, Text } from "react-aria-components"
import { useDrizzleLive, useDrizzleLiveIncremental } from "~/lib/hooks/use-drizzle-live"

export interface BankConnectorProps {
	isOpen: boolean
	setIsOpen: (isOpen: boolean) => void
}

export const BankConnector = ({ isOpen, setIsOpen }: BankConnectorProps) => {
	const api = useApi()

	const createLinkTokenMutation = api.useMutation("post", "/gocardless/link", {
		onSuccess: (data) => {
			window.location.href = data.link
		},
	})

	const [bankFilter, setBankFilter] = useState<string>("")
	const [selectedCountry, setSelectedCountry] = useState<string>("DE")

	const uniqueContriesQuery = useLiveQuery.sql<{ country: string }>`SELECT DISTINCT jsonb_array_elements(countries) AS country
FROM public.institutions;`


	const { rows: institutions } = useDrizzleLiveIncremental("id",(db) =>
		db.query.institutions.findMany({
			limit: 100,
			where: (t, { and, sql, ilike }) =>
				and(sql`${t.countries}::jsonb ? ${selectedCountry}`, ilike(t.name, `%${bankFilter}%`)),
		}),
	)



	const mappedCountries = useMemo(() => {
		if(!uniqueContriesQuery?.rows.length){
			return []
		}
		return uniqueContriesQuery.rows.map((country) => ({
			value: country.country,
			label: country.country,
		}))
	}, [uniqueContriesQuery])

	return (
		<Modal isOpen={isOpen} onOpenChange={setIsOpen}>
			<Modal.Content aria-label="Bank Connector Dialog">
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
							aria-label="Search bank"
						/>
						<ComboBox
							aria-label="Select country"
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
					<ListBox className="flex flex-col gap-4">
						{institutions.map((institution) => (
							<ListBoxItem
								key={institution.id}
								textValue={institution.name}
								className="flex items-center justify-between gap-2 focus:outline-none"
							>
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
						))}
					</ListBox>
				</Modal.Body>
			</Modal.Content>
		</Modal>
	)
}
