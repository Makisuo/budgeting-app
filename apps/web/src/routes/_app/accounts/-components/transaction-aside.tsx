import { Link } from "@tanstack/react-router"
import { capitalizeFirstLetter } from "better-auth/react"
import type { Account, Transaction } from "db"
import { atom, useAtom } from "jotai"
import { IconArrowDown, IconArrowRight, IconCirclePlaceholderDashed, IconHighlight, IconRefresh } from "justd-icons"
import { startTransition, useMemo, useState } from "react"
import { toast } from "sonner"
import { PrivateValue } from "~/components/private-value"
import { Badge, Button, ComboBox, Form, Modal, Note, Sheet, buttonStyles } from "~/components/ui"
import { DetailLine } from "~/components/ui/detail-line"
import { useApi } from "~/lib/api/client"
import { currencyFormatter, dashboardCompactNumberFormatter } from "~/utils/formatters"
import { useDrizzleLive } from "~/utils/pglite/drizzle-client"
import { StatusBadge } from "./status-badge"
import { TransactionDestinationCard } from "./transaction-destination-card"

export const transactionAsideAtom = atom<{
	open: boolean
	transactionId: Transaction["id"] | null
}>({ open: false, transactionId: null })

export const TransactionAside = ({
	accountId,
}: {
	accountId?: Account["id"]
}) => {
	const [dialogData, setDialogData] = useAtom(transactionAsideAtom)

	const { data: transaction } = useDrizzleLive((db) =>
		db.query.transactions.findFirst({
			with: {
				company: true,
				category: true,
				account: {
					with: {
						institution: true,
					},
				},
			},
			where: (table, { eq }) => eq(table.id, dialogData.transactionId ?? ("" as Transaction["id"])),
		}),
	)

	const { data: similarTransactions } = useDrizzleLive((db) =>
		db.query.transactions.findMany({
			with: {
				company: true,
				category: true,
			},
			where: (table, { eq, and }) =>
				and(accountId ? eq(table.accountId, accountId) : undefined, eq(table.name, transaction?.name ?? "")),
		}),
	)

	const totalSpent = useMemo(
		() =>
			similarTransactions.reduce((total, transaction) => {
				return total + transaction.amount
			}, 0),
		[similarTransactions],
	)

	const averageAmount = useMemo(
		() =>
			similarTransactions.reduce((total, transaction) => {
				return total + transaction.amount
			}, 0) / similarTransactions.length,
		[similarTransactions],
	)

	if (!transaction) {
		return null
	}

	return (
		<Sheet.Content isOpen={dialogData.open} onOpenChange={(open) => setDialogData({ open, transactionId: null })}>
			<Sheet.Header className="flex flex-col gap-3">
				<Sheet.Title className="flex gap-2">
					{transaction.company ? (
						<img
							className="size-6 rounded-md"
							src={`https://cdn.brandfetch.io/${transaction.company.url}/w/512/h/512?c=1id0IQ-4i8Z46-n-DfQ`}
							alt={transaction.company.name}
						/>
					) : (
						<IconCirclePlaceholderDashed className="size-6" />
					)}
					{transaction.company?.name || transaction.name}
				</Sheet.Title>
				{transaction.company && transaction.company.name !== transaction.name && (
					<Sheet.Description>{transaction.name}</Sheet.Description>
				)}
			</Sheet.Header>
			<Sheet.Body className="flex flex-col gap-12">
				<DetailLine className="w-full">
					<DetailLine.Item label="Amount" className={transaction.amount < 0 ? "text-danger" : "text-success"}>
						<DetailLine.Description>
							<PrivateValue>
								{currencyFormatter(transaction.currency ?? "USD").format(transaction.amount)}
							</PrivateValue>
						</DetailLine.Description>
					</DetailLine.Item>
					<DetailLine.Item label="Status">
						<DetailLine.Description>
							<StatusBadge status={transaction.status} />
						</DetailLine.Description>
					</DetailLine.Item>
					<DetailLine.Item label="Category">
						<DetailLine.Description>
							<Link
								to="/accounts/$accountId"
								params={{ accountId: transaction.accountId }}
								search={{ categoryId: transaction.categoryId }}
							>
								<Badge>{transaction.category.name}</Badge>
							</Link>
						</DetailLine.Description>
					</DetailLine.Item>
				</DetailLine>
				<DetailLine className="w-full">
					<DetailLine.Item
						label={totalSpent < 0 ? "Total Spent" : "Total Received"}
						className={totalSpent < 0 ? "text-danger" : "text-success"}
					>
						<DetailLine.Description>
							<PrivateValue>
								{currencyFormatter(transaction.currency ?? "USD").format(totalSpent)}
							</PrivateValue>
						</DetailLine.Description>
					</DetailLine.Item>
					<DetailLine.Item
						label="Total Transactions"
						description={dashboardCompactNumberFormatter().format(similarTransactions.length)}
					/>
					<DetailLine.Item label="Average Amount" className={totalSpent < 0 ? "text-danger" : "text-success"}>
						<DetailLine.Description>
							<PrivateValue>
								{currencyFormatter(transaction.currency ?? "USD").format(averageAmount)}
							</PrivateValue>
						</DetailLine.Description>
					</DetailLine.Item>
				</DetailLine>

				<div className="flex w-full flex-col gap-2">
					{transaction.directTransfer && (
						<Note indicator={false} intent="info">
							<div className="flex items-center gap-2">
								<IconRefresh />
								This is a direct transfer.
							</div>
						</Note>
					)}
					<TransactionDestinationCard type="from" transaction={transaction} />
					<div className="flex justify-center text-muted-fg">
						<IconArrowDown className="size-3" />
					</div>
					<TransactionDestinationCard type="to" transaction={transaction} />
				</div>
			</Sheet.Body>
			<Sheet.Footer>
				<EditTransactionModal transactionId={transaction.id} />
				<Link
					onClick={() => setDialogData({ open: false, transactionId: null })}
					className={buttonStyles({ className: "w-full" })}
					to={"/accounts/$accountId"}
					params={{ accountId: transaction.accountId }}
					search={{ transactionName: transaction.name }}
				>
					Explore <IconArrowRight />
				</Link>
			</Sheet.Footer>
		</Sheet.Content>
	)
}

const EditTransactionModal = ({ transactionId }: { transactionId: Transaction["id"] }) => {
	const api$ = useApi()

	const [open, setOpen] = useState(false)

	const updateTransactionMutation = api$.useMutation("post", "/transactions/{id}", {
		onSuccess: () => setOpen(false),
	})

	const { data: categories } = useDrizzleLive((db) => db.query.categories.findMany({}))

	const { data: transaction } = useDrizzleLive((db) =>
		db.query.transactions.findFirst({
			where: (table, { eq }) => eq(table.id, transactionId),
			with: {
				company: true,
			},
		}),
	)

	if (!transaction) {
		return null
	}

	const categorizedCategories = Object.entries(Object.groupBy(categories, (item) => item.type))

	return (
		<Modal isOpen={open} onOpenChange={setOpen}>
			<Button className="w-full">
				<IconHighlight />
				Edit
			</Button>
			<Modal.Content>
				<Modal.Header>
					<Modal.Title>Edit Transaction.</Modal.Title>
					<Modal.Description>Edit the transaction details and category.</Modal.Description>
				</Modal.Header>
				<Form
					onSubmit={(e) => {
						e.preventDefault()

						startTransition(async () => {
							const formData = new FormData(e.currentTarget)

							const category = formData.get("category")

							await toast
								.promise(
									updateTransactionMutation.mutateAsync({
										params: {
											path: {
												id: transactionId,
											},
										},
										body: {
											categoryId: category?.toString() || "uncategorized",
										},
									}),
									{
										position: "top-center",
									},
								)
								.unwrap()
						})
					}}
				>
					<Modal.Body className="pb-1">
						<ComboBox
							name="category"
							defaultSelectedKey={transaction.categoryId}
							placeholder="Select a Category"
							label="Category"
						>
							<ComboBox.Input />
							<ComboBox.List items={categorizedCategories}>
								{([name, item]) => (
									<ComboBox.Section title={capitalizeFirstLetter(name)} items={item} id={name}>
										{(category) => (
											<ComboBox.Option textValue={category.name} id={category.id}>
												<ComboBox.Label>{category.name}</ComboBox.Label>
											</ComboBox.Option>
										)}
									</ComboBox.Section>
								)}
							</ComboBox.List>
						</ComboBox>
					</Modal.Body>
					<Modal.Footer>
						<Modal.Close>Cancel</Modal.Close>
						<Button type="submit">Update</Button>
					</Modal.Footer>
				</Form>
			</Modal.Content>
		</Modal>
	)
}
