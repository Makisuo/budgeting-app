import { Link } from "@tanstack/react-router"
import { capitalizeFirstLetter } from "better-auth/react"
import { atom, useAtom } from "jotai"
import { IconArrowRight, IconCirclePlaceholderDashed } from "justd-icons"
import { useMemo } from "react"
import { Sheet, buttonStyles } from "~/components/ui"
import { DetailLine } from "~/components/ui/detail-line"
import { currencyFormatter, dashboardCompactNumberFormatter } from "~/utils/formatters"
import { useDrizzleLive } from "~/utils/pglite/drizzle-client"

export const transactionAsideAtom = atom<{
	open: boolean
	transactionId: string | null
}>({ open: false, transactionId: null })

export const TransactionAside = () => {
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
			where: (table, { eq }) => eq(table.name, transaction?.name ?? ""),
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
					<DetailLine.Item label="Status" description={capitalizeFirstLetter(transaction.status)} />
					<DetailLine.Item label="Category" description={transaction.category.name} />
				</DetailLine>
				<DetailLine className="w-full">
					<DetailLine.Item
						label={totalSpent < 0 ? "Total Spent" : "Total Received"}
						className={totalSpent < 0 ? "text-danger" : "text-success"}
						description={currencyFormatter(transaction.currency ?? "USD").format(totalSpent)}
					/>
					<DetailLine.Item
						label="Total Transactions"
						description={dashboardCompactNumberFormatter().format(similarTransactions.length + 1)}
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
						Explore Transactions <IconArrowRight />
					</Link>
				</div>
			</Sheet.Body>
			<Sheet.Footer>
				<Sheet.Close>Cancel</Sheet.Close>
			</Sheet.Footer>
		</Sheet.Content>
	)
}
