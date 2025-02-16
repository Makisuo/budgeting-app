"use client"

import { Cell, Pie, PieChart as PieChartPrimitive } from "recharts"

import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

import type { ComponentProps } from "react"
import { cn } from "~/utils/classes"
import { type BaseChartProps, Chart, ChartTooltip, ChartTooltipContent, DEFAULT_COLORS, getColorValue } from "./chart"

const sumNumericArray = (arr: number[]): number => arr.reduce((sum, num) => sum + num, 0)

const calculateDefaultLabel = (data: any[], valueKey: string): number =>
	sumNumericArray(data.map((dataPoint) => dataPoint[valueKey]))

const parseLabelInput = (
	labelInput: string | undefined,
	valueFormatter: (value: number) => string,
	data: any[],
	valueKey: string,
): string => labelInput || valueFormatter(calculateDefaultLabel(data, valueKey))

interface PieChartProps<TValue extends ValueType, TName extends NameType>
	extends Omit<
		BaseChartProps<TValue, TName>,
		| "hideGridLines"
		| "hideXAxis"
		| "hideYAxis"
		| "xAxisProps"
		| "yAxisProps"
		| "displayEdgeLabelsOnly"
		| "legend"
		| "legendProps"
	> {
	variant?: "pie" | "donut"
	nameKey?: string

	chartProps?: Omit<ComponentProps<typeof PieChartPrimitive>, "data" | "stackOffset">

	label?: string
	showLabel?: boolean
}

const PieChart = <TValue extends ValueType, TName extends NameType>({
	data = [],
	dataKey,
	colors = DEFAULT_COLORS,
	className,
	config,
	children,

	label,
	showLabel,

	// Components
	tooltip = true,
	tooltipProps,

	variant = "pie",
	nameKey,

	chartProps,

	valueFormatter = (value: number) => value.toString(),

	...props
}: PieChartProps<TValue, TName>) => {
	const parsedLabelInput = parseLabelInput(label, valueFormatter, data, dataKey)

	return (
		<Chart
			className={cn("size-40", className)}
			config={config}
			data={data}
			layout="radial"
			dataKey={dataKey}
			{...props}
		>
			{({ onLegendSelect, selectedLegend }) => (
				<PieChartPrimitive
					data={data}
					onClick={() => {
						onLegendSelect(null)
					}}
					margin={{
						bottom: 0,
						left: 0,
						right: 0,
						top: 0,
					}}
					{...chartProps}
				>
					{showLabel && variant === "donut" && (
						<text className="fill-fg" x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
							{parsedLabelInput}
						</text>
					)}
					<Pie
						name={nameKey}
						dataKey={dataKey}
						data={data}
						cx="50%"
						cy="50%"
						startAngle={90}
						endAngle={-270}
						strokeLinejoin="round"
						innerRadius={variant === "donut" ? "75%" : "0%"}
						outerRadius="100%"
						isAnimationActive
					>
						{data.map((_, index) => (
							<Cell key={`cell-${index}`} fill={getColorValue(colors[index % colors.length])} />
						))}
					</Pie>

					{tooltip && (
						<ChartTooltip
							content={
								typeof tooltip === "boolean" ? <ChartTooltipContent accessibilityLayer /> : tooltip
							}
							{...tooltipProps}
						/>
					)}

					{children}
				</PieChartPrimitive>
			)}
		</Chart>
	)
}

export type { PieChartProps }
export { PieChart }
