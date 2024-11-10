import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/start"
import { TraceTable } from "~/components/trace-table"
import { clickhouseClient } from "~/utils/clickhouse"
import type { Span } from "~/utils/types"

export const getTraces = createServerFn("GET", async () => {
	const resultSet = await clickhouseClient.query({
		query: "SELECT * FROM traces",
		format: "JSONEachRow",
	})

	const data = (await resultSet.json()) as Span[]

	const parentTraces = data
		.filter((item) => item.kind === 1 && !item.parent_span_id)
		.map((item) => {
			const children = data.filter((child) => child.parent_span_id === item.span_id)
			return {
				...item,
				children,
			}
		})

	return parentTraces
})

export const Route = createFileRoute("/traces")({
	component: TracesPage,
	loader: async () => getTraces(),
})

function TracesPage() {
	const data = Route.useLoaderData()

	console.log(data)

	return <TraceTable spans={data} />
}
