import { Link } from "@tanstack/react-router"
import { capitalizeFirstLetter } from "better-auth/react"
import { atom, useAtom } from "jotai"
import { IconArrowRight, IconCirclePlaceholderDashed, IconHighlight } from "justd-icons"
import { useMemo } from "react"
import { Badge, Button, ComboBox, Form, Modal, Sheet, TextField, buttonStyles } from "~/components/ui"
import { DetailLine } from "~/components/ui/detail-line"
import { currencyFormatter, dashboardCompactNumberFormatter } from "~/utils/formatters"
import { useDrizzleLive } from "~/utils/pglite/drizzle-client"
import { StatusBadge } from "./status-badge"

export const transactionAsideAtom = atom<{
	open: boolean
	transactionId: string | null
}>({ open: false, transactionId: null })

export const TransactionAside = ({
	accountId,
}: {
	accountId?: string
}) => {
	const [dialogData, setDialogData] = useAtom(transactionAsideAtom)

	const { data: transaction } = useDrizzleLive((db) =>
		db.query.transactions.findFirst({
			with: {
				company: true,
				category: true,
			},
			where: (table, { eq }) => eq(table.id, dialogData.transactionId ?? ""),
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
					<DetailLine.Item
						label="Amount"
						className={transaction.amount < 0 ? "text-danger" : "text-success"}
						description={currencyFormatter(transaction.currency ?? "USD").format(transaction.amount)}
					/>
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
						description={currencyFormatter(transaction.currency ?? "USD").format(totalSpent)}
					/>
					<DetailLine.Item
						label="Total Transactions"
						description={dashboardCompactNumberFormatter().format(similarTransactions.length)}
					/>
					<DetailLine.Item
						label="Average Amount"
						className={totalSpent < 0 ? "text-danger" : "text-success"}
						description={currencyFormatter(transaction.currency ?? "USD").format(averageAmount)}
					/>
				</DetailLine>
				<div className="flex justify-end">
					<Link
						onClick={() => setDialogData({ open: false, transactionId: null })}
						className={buttonStyles()}
						to={"/accounts/$accountId"}
						params={{ accountId: transaction.accountId }}
						search={{ transactionName: transaction.name }}
					>
						Explore all Transactions <IconArrowRight />
					</Link>
				</div>
			</Sheet.Body>
			<Sheet.Footer>
				<EditTransactionModal transactionId={transaction.id} />
			</Sheet.Footer>
		</Sheet.Content>
	)
}

const EditTransactionModal = ({ transactionId }: { transactionId: string }) => {
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

	return (
		<Modal>
			<Button>
				<IconHighlight />
				Edit
			</Button>
			<Modal.Content>
				<Modal.Header>
					<Modal.Title>Nice! Let's beef up your account.</Modal.Title>
					<Modal.Description>
						2FA beefs up your account's defense. Pop in your password to keep going.
					</Modal.Description>
				</Modal.Header>
				<Form onSubmit={() => {}}>
					<Modal.Body className="pb-1">
						<ComboBox placeholder="Select a user" label="Users">
							<ComboBox.Input />
							<ComboBox.List defaultSelectedKeys={[transaction?.categoryId]} items={categories}>
								{(item) => (
									<ComboBox.Option id={item.id} textValue={item.name}>
										<ComboBox.Label>{item.name}</ComboBox.Label>
									</ComboBox.Option>
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
