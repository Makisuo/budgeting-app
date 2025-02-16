import { createFileRoute } from "@tanstack/react-router"
import { type ChartColorKeys, PieChart } from "~/components/ui"
import { BudgetStats } from "./-components/budget-stats"

import { ResponsivePie } from "@nivo/pie"

export const Route = createFileRoute("/_app/budgets/")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className="space-y-6">
			<BudgetStats />

			<div className="relative h-[400px] w-full">
				<ResponsivePie
					data={[
						{
							id: "scala",
							label: "scala",
							value: 249,
							color: "hsl(172, 70%, 50%)",
						},
						{
							id: "php",
							label: "php",
							value: 360,
							color: "hsl(126, 70%, 50%)",
						},
						{
							id: "python",
							label: "python",
							value: 573,
							color: "hsl(242, 70%, 50%)",
						},
						{
							id: "c",
							label: "c",
							value: 44,
							color: "hsl(318, 70%, 50%)",
						},
						{
							id: "rust",
							label: "rust",
							value: 29,
							color: "hsl(297, 70%, 50%)",
						},
					]}
					margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
					innerRadius={0.5}
					padAngle={0.7}
					cornerRadius={3}
					activeOuterRadiusOffset={8}
					borderWidth={1}
					borderColor={{
						from: "color",
						modifiers: [["darker", 0.2]],
					}}
					arcLinkLabelsSkipAngle={10}
					arcLinkLabelsTextColor="var(--color-fg)"
					arcLinkLabelsThickness={2}
					arcLinkLabelsColor={{ from: "color" }}
					arcLabelsSkipAngle={10}
					arcLabelsTextColor={{
						from: "color",
						modifiers: [["darker", 2]],
					}}
					defs={[
						{
							id: "dots",
							type: "patternDots",
							background: "inherit",
							color: "rgba(255, 255, 255, 0.3)",
							size: 4,
							padding: 1,
							stagger: true,
						},
						{
							id: "lines",
							type: "patternLines",
							background: "inherit",
							color: "rgba(255, 255, 255, 0.3)",
							rotation: -45,
							lineWidth: 6,
							spacing: 10,
						},
					]}
					fill={[
						{
							match: {
								id: "ruby",
							},
							id: "dots",
						},
						{
							match: {
								id: "c",
							},
							id: "dots",
						},
						{
							match: {
								id: "go",
							},
							id: "dots",
						},
						{
							match: {
								id: "python",
							},
							id: "dots",
						},
						{
							match: {
								id: "scala",
							},
							id: "lines",
						},
						{
							match: {
								id: "lisp",
							},
							id: "lines",
						},
						{
							match: {
								id: "elixir",
							},
							id: "lines",
						},
						{
							match: {
								id: "javascript",
							},
							id: "lines",
						},
					]}
					legends={[
						{
							anchor: "bottom",
							direction: "row",
							justify: false,
							translateX: 0,
							translateY: 56,
							itemsSpacing: 0,
							itemWidth: 100,
							itemHeight: 18,
							itemTextColor: "var(--color-fg)",
							itemDirection: "left-to-right",
							itemOpacity: 1,
							symbolSize: 18,
							symbolShape: "circle",
							effects: [
								{
									on: "hover",
									style: {
										itemTextColor: "var(--color-muted-fg)",
									},
								},
							],
						},
					]}
				/>
			</div>
		</div>
	)
}
