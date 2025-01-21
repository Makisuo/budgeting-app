import type React from "react"

import { tv } from "tailwind-variants"

import { cn } from "~/utils/classes"

const table = tv({
	slots: {
		root: "table w-full min-w-full caption-bottom border-spacing-0 text-sm outline-hidden [--table-selected-bg:color-mix(in_oklab,var(--color-primary)_5%,white_90%)] **:data-drop-target:border **:data-drop-target:border-primary dark:[--table-selected-bg:color-mix(in_oklab,var(--color-primary)_25%,black_70%)]",
		header: "x32 border-b",
		row: "tr group relative cursor-default border-b bg-bg hover:bg-secondary/70 text-fg/70 outline-hidden ring-primary data-selected:hover:bg-(--table-selected-bg)/70 data-selected:bg-(--table-selected-bg) data-focus-visible:ring-1 data-focused:ring-0 dark:data-selected:hover:bg-[color-mix(in_oklab,var(--color-primary)_40%,black_60%)] dark:data-selected:hover:bg-subtle/60",
		cellIcon:
			"grid size-[1.15rem] flex-none shrink-0 place-content-center rounded bg-secondary text-fg *:data-[slot=icon]:size-3.5 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:transition-transform *:data-[slot=icon]:duration-200",
	},
})

const { root, header, row, cellIcon } = table()

interface TableProps extends React.HTMLProps<HTMLTableElement> {}

const Table = ({ children, className, ...props }: TableProps) => (
	<div className="relative w-full overflow-auto">
		<table {...props} className={root({ className })}>
			{children}
		</table>
	</div>
)

const Body = (props: React.HTMLProps<HTMLDivElement>) => (
	<div {...props} className={cn("[&_.tr:last-child]:border-0")} />
)

const cellStyles = tv({
	base: "group whitespace-nowrap px-3 py-3 outline-hidden",
	variants: {
		allowResize: {
			true: "overflow-hidden truncate",
		},
	},
})
const TableCell = ({ children, className, ...props }: React.HTMLProps<HTMLTableCellElement>) => {
	return (
		<td {...props} className={cellStyles({ className })}>
			{children}
		</td>
	)
}

const columnStyles = tv({
	base: "relative allows-sorting:cursor-pointer whitespace-nowrap px-3 py-3 text-left font-medium outline-hidden data-dragging:cursor-grabbing [&:has([slot=selection])]:pr-0",
	variants: {
		isResizable: {
			true: "overflow-hidden truncate",
		},
	},
})

const TableColumn = ({ className, ...props }: React.HTMLProps<HTMLTableCellElement>) => {
	return (
		<th
			data-slot="table-column"
			{...props}
			className={columnStyles({
				className,
			})}
		/>
	)
}

const Header = ({ className, ...props }: React.HTMLProps<HTMLTableRowElement>) => {
	return <tr className={header({ className })} {...props} />
}

const TableRow = ({ children, className, id, ref, ...props }: React.HTMLProps<HTMLTableRowElement>) => {
	return (
		<tr
			ref={ref}
			{...props}
			className={row({
				className:
					"href" in props
						? cn("cursor-pointer hover:bg-secondary/50 hover:text-secondary-fg", className)
						: "",
			})}
		>
			{children}
		</tr>
	)
}

Table.Body = Body
Table.Cell = TableCell
Table.Column = TableColumn
Table.Header = Header
Table.Row = TableRow

export type { TableProps }
export { Table }
