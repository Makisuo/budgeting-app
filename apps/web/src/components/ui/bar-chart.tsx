"use client"

import { Bar, BarChart as BarChartPrimitive } from "recharts"

import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

import { startTransition } from "react"
import { cn } from "~/utils/classes"
import {
	Chart,
	ChartLegendContent,
	ChartTooltipContent,
	DEFAULT_COLORS,
	constructCategoryColors,
	getColorValue,
} from "./chart"
import {
	type BaseChartProps,
	CartesianGrid,
	type ChartLayout,
	ChartLegend,
	ChartTooltip,
	XAxis,
	YAxis,
	valueToPercent,
} from "./chart"

interface BarChartProps<TValue extends ValueType, TName extends NameType> extends BaseChartProps<TValue, TName> {
	layout?: ChartLayout
	barCategoryGap?: number
	barRadius?: number
	barGap?: number
	barSize?: number
}

const BarChart = <TValue extends ValueType, TName extends NameType>({
	data = [],
	dataKey,
	colors = DEFAULT_COLORS,
	type = "default",
	className,
	config,
	children,
	layout = "horizontal",

	// Components
	tooltip = true,
	tooltipProps,

	legend = true,
	legendProps,

	intervalType = "equidistantPreserveStart",

	barCategoryGap = 5,
	barGap,
	barSize,
	barRadius,

	valueFormatter = (value: number) => value.toString(),

	// XAxis
	displayEdgeLabelsOnly = false,
	xAxisProps,

	// YAxis
	yAxisProps,

	hideGridLines = false,
	hideXAxis = false,
	hideYAxis = false,
	...props
}: BarChartProps<TValue, TName>) => {
	const categoryColors = constructCategoryColors(Object.keys(config), colors)

	const stacked = type === "stacked" || type === "percent"

	return (
		<Chart
			className={cn("w-full", className)}
			config={config}
			data={data}
			dataKey={dataKey}
			layout={layout}
			{...props}
		>
			{({ onLegendSelect, selectedLegend }) => (
				<BarChartPrimitive
					className="min-h-[400px]"
					onClick={() => {
						onLegendSelect(null)
					}}
					data={data}
					margin={{
						bottom: 0,
						left: 5,
						right: 0,
						top: 5,
					}}
					layout={layout}
					barGap={barGap}
					barSize={barSize}
					barCategoryGap={barCategoryGap}
					stackOffset={type === "percent" ? "expand" : stacked ? "sign" : undefined}
				>
					{!hideGridLines && <CartesianGrid strokeDasharray="3 3" />}
					<XAxis
						hide={hideXAxis}
						className="**:[text]:fill-muted-fg"
						// Chart Data
						displayEdgeLabelsOnly={displayEdgeLabelsOnly}
						intervalType={intervalType}
						{...xAxisProps}
					/>
					<YAxis
						hide={hideYAxis}
						className="**:[text]:fill-muted-fg"
						tickFormatter={type === "percent" ? valueToPercent : valueFormatter}
						{...yAxisProps}
					/>

					{legend && (
						<ChartLegend
							content={typeof legend === "boolean" ? <ChartLegendContent /> : legend}
							{...legendProps}
						/>
					)}

					{tooltip && (
						<ChartTooltip
							content={
								typeof tooltip === "boolean" ? <ChartTooltipContent accessibilityLayer /> : tooltip
							}
							{...tooltipProps}
						/>
					)}

					{Object.entries(config).map(([category, values]) => {
						return (
							<Bar
								key={category}
								name={category}
								dataKey={category}
								stroke={getColorValue(values.color || categoryColors.get(category))}
								strokeWidth={1}
								stackId={stacked ? "stack" : undefined}
								onClick={(item, number, event) => {
									event.stopPropagation()

									startTransition(() => {
										onLegendSelect(category)
									})
								}}
								radius={barRadius ?? (stacked ? undefined : 4)}
								strokeOpacity={selectedLegend && selectedLegend !== category ? 0.2 : 0}
								fillOpacity={selectedLegend && selectedLegend !== category ? 0.1 : 1}
								fill={getColorValue(values.color || categoryColors.get(category))}
							/>
						)
					})}
					{children}
				</BarChartPrimitive>
			)}
		</Chart>
	)
}

export type { BarChartProps }
export { BarChart }
