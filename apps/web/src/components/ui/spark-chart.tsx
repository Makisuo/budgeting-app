"use client"

import { useId } from "react"

import {
	Area,
	AreaChart as AreaChartPrimitive,
	Bar,
	BarChart as BarChartPrimitive,
	Line,
	LineChart as LineChartPrimitive,
} from "recharts"
import type { AxisDomain } from "recharts/types/util/types"

import {
	Chart,
	type ChartColorKeys,
	type ChartConfig,
	ChartTooltip,
	ChartTooltipContent,
	DEFAULT_COLORS,
	XAxis,
	YAxis,
	constructCategoryColors,
	getColorValue,
} from "./chart"

import { cn } from "~/utils/classes"

import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"
import type { ContentType } from "recharts/types/component/Tooltip"
import type { CurveType } from "recharts/types/shape/Curve"

export type SparkChartType = "default" | "stacked" | "percent"

interface SparkBaseProps<TValue extends ValueType, TName extends NameType>
	extends React.HTMLAttributes<HTMLDivElement> {
	config: ChartConfig
	data: Record<string, any>[]
	dataKey: string
	colors?: readonly ChartColorKeys[]
	yAxisDomain?: AxisDomain
	type?: SparkChartType
	tooltip?: ContentType<TValue, TName> | boolean
}

export interface SparkAreaChartProps<TValue extends ValueType, TName extends NameType>
	extends SparkBaseProps<TValue, TName> {
	connectNulls?: boolean
	fillType?: "gradient" | "solid" | "none"
	lineType?: CurveType
}

const SparkAreaChart = <TValue extends ValueType, TName extends NameType>({
	data = [],
	dataKey,
	colors = DEFAULT_COLORS,
	yAxisDomain = ["auto", "auto"],
	connectNulls = false,
	type = "default",
	className,
	fillType = "gradient",
	lineType = "natural",
	config,
	tooltip,
	...props
}: SparkAreaChartProps<TValue, TName>) => {
	const categoryColors = constructCategoryColors(Object.keys(config), colors)

	const stacked = type === "stacked" || type === "percent"
	const areaId = useId()

	const getFillContent = (fillType: SparkAreaChartProps<TValue, TName>["fillType"]) => {
		switch (fillType) {
			case "none":
				return <stop stopColor="currentColor" stopOpacity={0} />
			case "gradient":
				return (
					<>
						<stop offset="5%" stopColor="currentColor" stopOpacity={0.5} />
						<stop offset="95%" stopColor="currentColor" stopOpacity={0.1} />
					</>
				)
			case "solid":
				return <stop stopColor="currentColor" stopOpacity={0.3} />
			default:
				return <stop stopColor="currentColor" stopOpacity={0.3} />
		}
	}

	return (
		<Chart className={cn("h-12 w-28", className)} config={config} data={data} dataKey={dataKey} {...props}>
			<AreaChartPrimitive
				data={data}
				margin={{
					bottom: 0,
					left: 0,
					right: 0,
					top: 0,
				}}
				stackOffset={type === "percent" ? "expand" : undefined}
			>
				<XAxis hide dataKey={dataKey} />
				<YAxis hide domain={yAxisDomain} />
				{tooltip && (
					<ChartTooltip
						cursor={false}
						content={
							typeof tooltip === "boolean" ? (
								<ChartTooltipContent accessibilityLayer hideLabel />
							) : (
								tooltip
							)
						}
					/>
				)}

				{Object.entries(config).map(([category, values]) => {
					const categoryId = `${areaId}-${category.replace(/[^a-zA-Z0-9]/g, "")}`
					return (
						<defs key={category}>
							<linearGradient
								key={category}
								style={{
									color: getColorValue(values.color || categoryColors.get(category)),
								}}
								id={categoryId}
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								{getFillContent(fillType)}
							</linearGradient>
						</defs>
					)
				})}

				{Object.entries(config).map(([category, values]) => {
					const categoryId = `${areaId}-${category.replace(/[^a-zA-Z0-9]/g, "")}`
					return (
						<Area
							key={category}
							dot={false}
							strokeOpacity={1}
							name={category}
							type={lineType}
							dataKey={category}
							stroke={getColorValue(values.color || categoryColors.get(category))}
							strokeWidth={2}
							strokeLinejoin="round"
							strokeLinecap="round"
							isAnimationActive={false}
							connectNulls={connectNulls}
							stackId={stacked ? "stack" : undefined}
							fill={`url(#${categoryId})`}
						/>
					)
				})}
			</AreaChartPrimitive>
		</Chart>
	)
}

export interface SparkLineChartProps<TValue extends ValueType, TName extends NameType>
	extends SparkBaseProps<TValue, TName> {
	connectNulls?: boolean
}

const SparkLineChart = <TValue extends ValueType, TName extends NameType>({
	data = [],
	dataKey,
	colors = DEFAULT_COLORS,
	yAxisDomain = ["auto", "auto"],
	connectNulls = false,
	type = "default",
	className,
	config,
	tooltip,
	...props
}: SparkLineChartProps<TValue, TName>) => {
	const categoryColors = constructCategoryColors(Object.keys(config), colors)

	return (
		<Chart className={cn("h-12 w-28", className)} dataKey={dataKey} data={data} config={config} {...props}>
			<LineChartPrimitive
				data={data}
				margin={{
					bottom: 0,
					left: 0,
					right: 0,
					top: 0,
				}}
				stackOffset={type === "percent" ? "expand" : undefined}
			>
				<XAxis hide />
				<YAxis hide domain={yAxisDomain} />
				{tooltip && (
					<ChartTooltip
						cursor={false}
						content={
							typeof tooltip === "boolean" ? (
								<ChartTooltipContent hideLabel accessibilityLayer />
							) : (
								tooltip
							)
						}
					/>
				)}

				{Object.entries(config).map(([category, values]) => {
					return (
						<Line
							stroke={getColorValue(values.color || categoryColors.get(category))}
							dot={false}
							strokeOpacity={1}
							key={category}
							name={category}
							type="linear"
							dataKey={category}
							strokeWidth={2}
							strokeLinejoin="round"
							strokeLinecap="round"
							isAnimationActive={false}
							connectNulls={connectNulls}
						/>
					)
				})}
			</LineChartPrimitive>
		</Chart>
	)
}

export interface SparkBarChartProps<TValue extends ValueType, TName extends NameType>
	extends SparkBaseProps<TValue, TName> {
	barCategoryGap?: string | number
	barRadius?: number
}

const SparkBarChart = <TValue extends ValueType, TName extends NameType>({
	data = [],
	dataKey,
	colors = DEFAULT_COLORS,
	yAxisDomain = ["auto", "auto"],
	barCategoryGap,
	type = "default",
	className,
	barRadius = 4,
	config,
	tooltip,
	...props
}: SparkBarChartProps<TValue, TName>) => {
	const categoryColors = constructCategoryColors(Object.keys(config), colors)

	const stacked = type === "stacked" || type === "percent"

	return (
		<Chart className={cn("h-12 w-28", className)} dataKey={dataKey} data={data} config={config} {...props}>
			<BarChartPrimitive
				data={data}
				margin={{
					bottom: 0,
					left: 0,
					right: 0,
					top: 0,
				}}
				stackOffset={type === "percent" ? "expand" : undefined}
				barCategoryGap={barCategoryGap}
			>
				<XAxis hide dataKey={dataKey} />
				<YAxis hide domain={yAxisDomain} />
				{tooltip && (
					<ChartTooltip
						cursor={false}
						content={
							typeof tooltip === "boolean" ? (
								<ChartTooltipContent accessibilityLayer hideLabel />
							) : (
								tooltip
							)
						}
					/>
				)}

				{Object.entries(config).map(([category, values]) => {
					return (
						<Bar
							fill={getColorValue(values.color || categoryColors.get(category))}
							key={category}
							name={category}
							type="linear"
							radius={barRadius}
							dataKey={category}
							stackId={stacked ? "stack" : undefined}
						/>
					)
				})}
			</BarChartPrimitive>
		</Chart>
	)
}

export { SparkAreaChart, SparkLineChart, SparkBarChart }
