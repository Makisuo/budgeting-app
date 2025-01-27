import { IconChevronLgLeft, IconChevronLgRight } from "justd-icons"
import {
	CalendarCell,
	CalendarGrid,
	CalendarGridBody,
	CalendarGridHeader as CalendarGridHeaderPrimitive,
	CalendarHeaderCell,
	Calendar as CalendarPrimitive,
	type CalendarProps as CalendarPrimitiveProps,
	type DateValue,
	Heading,
	Text,
	composeRenderProps,
	useLocale,
} from "react-aria-components"
import { tv } from "tailwind-variants"

import { compactCurrencyFormatter, currencyFormatter } from "~/utils/formatters"
import { useDrizzleLive, useDrizzlePGlite } from "~/utils/pglite/drizzle-client"
import { PrivateValue } from "../private-value"
import { Button } from "./button"
import { composeTailwindRenderProps, focusRing } from "./primitive"

import { CalendarDate, getLocalTimeZone, parseDate } from "@internationalized/date"
import { schema } from "db"
import { sql } from "drizzle-orm"
import { cn } from "~/utils/classes"

const cell = tv({
	extend: focusRing,
	base: "flex size-18 cursor-default items-center justify-center rounded-lg tabular-nums sm:size-14 sm:text-sm forced-colors:outline-0",
	variants: {
		isSelected: {
			false: "text-fg data-hovered:bg-secondary-fg/15 data-pressed:bg-secondary-fg/20 forced-colors:text-[ButtonText]",
			true: "bg-primary text-primary-fg data-invalid:bg-danger data-invalid:text-danger-fg forced-colors:bg-[Highlight] forced-colors:text-[Highlight] forced-colors:data-invalid:bg-[Mark]",
		},
		isDisabled: {
			true: "text-muted-fg/70 forced-colors:text-[GrayText]",
		},
	},
})

interface CalendarProps<T extends DateValue> extends Omit<CalendarPrimitiveProps<T>, "visibleDuration"> {
	errorMessage?: string
	className?: string
	type: "income" | "expenses" | "all"
	transactionsData: {
		day: Date
		income: number
		expenses: number
	}[]
}

const Calendar = <T extends DateValue>({
	errorMessage,
	className,
	type,
	transactionsData,
	...props
}: CalendarProps<T>) => {
	return (
		<CalendarPrimitive className={composeTailwindRenderProps(className, "")} {...props}>
			<CalendarHeader />
			<CalendarGrid className="[&_td]:border-collapse [&_td]:px-0">
				<CalendarGridHeader />
				<CalendarGridBody>
					{(date) => {
						const transactionData = transactionsData.find((d) => {
							const year = d.day.getFullYear()
							const month = d.day.getMonth() + 1 // Convert 0-based to 1-based
							const day = d.day.getDate()
							const convertedDate = new CalendarDate(year, month, day)

							return convertedDate.toString() === date.toString()
						})

						return (
							<CalendarCell
								date={date}
								className={composeRenderProps(className, (className, renderProps) =>
									cell({
										...renderProps,
										className,
									}),
								)}
							>
								{(date) => {
									const value =
										type === "income"
											? Math.floor(transactionData?.income || 0)
											: type === "expenses"
												? Math.floor(transactionData?.expenses || 0)
												: Math.floor(
														(transactionData?.income || 0) +
															(transactionData?.expenses || 0),
													)
									return (
										<div className="flex flex-col items-center justify-center">
											{date.defaultChildren}
											{transactionData && (
												<p
													className={cn(
														"text-xs opacity-70",

														value > 0 ? "text-success" : "text-danger",
														value === 0 ? "text-muted-fg" : "",
													)}
												>
													<PrivateValue>
														{compactCurrencyFormatter("EUR").format(value)}
													</PrivateValue>
												</p>
											)}
										</div>
									)
								}}
							</CalendarCell>
						)
					}}
				</CalendarGridBody>
			</CalendarGrid>
			{errorMessage && (
				<Text slot="errorMessage" className="text-red-600 text-sm">
					{errorMessage}
				</Text>
			)}
		</CalendarPrimitive>
	)
}

const calendarHeaderStyles = tv({
	slots: {
		header: "flex w-full justify-center gap-1 px-4 pb-3 sm:pb-2",
		heading: "mr-2 flex-1 text-left font-lg text-muted-fg sm:text-sm",
		calendarGridHeaderCell: "font-semibold text-muted-fg text-sm pb-3",
	},
})

const { header, heading, calendarGridHeaderCell } = calendarHeaderStyles()

const CalendarHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
	const { direction } = useLocale()

	return (
		<header data-slot="calendar-header" className={header({ className })} {...props}>
			<Heading className={heading()} />
			<div className="flex items-center gap-1">
				<Button
					size="square-petite"
					className="size-8 **:data-[slot=icon]:text-fg sm:size-7"
					shape="circle"
					appearance="plain"
					slot="previous"
				>
					{direction === "rtl" ? <IconChevronLgRight /> : <IconChevronLgLeft aria-hidden />}
				</Button>
				<Button
					size="square-petite"
					className="size-8 **:data-[slot=icon]:text-fg sm:size-7"
					shape="circle"
					appearance="plain"
					slot="next"
				>
					{direction === "rtl" ? <IconChevronLgLeft /> : <IconChevronLgRight />}
				</Button>
			</div>
		</header>
	)
}

const CalendarGridHeader = () => {
	return (
		<CalendarGridHeaderPrimitive>
			{(day) => <CalendarHeaderCell className={calendarGridHeaderCell()}>{day}</CalendarHeaderCell>}
		</CalendarGridHeaderPrimitive>
	)
}

Calendar.Header = CalendarHeader

export { type CalendarProps, Calendar }
