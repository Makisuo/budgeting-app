import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/start"
import { Card } from "~/components/ui/card"
import { Container } from "~/components/ui/container"
import { clickhouseClient } from "~/utils/clickhouse"
import type { Span } from "~/utils/types"

export const getTrace = createServerFn("GET", async (traceId: string) => {
	const resultSet = await clickhouseClient.query({
		query: `SELECT * FROM traces WHERE trace_id='${traceId}'`,
		format: "JSONEachRow",
	})

	const data = (await resultSet.json()) as Span[]

	const spans = data.filter((item) => item.parent_span_id !== "")

	const mainTrace = { ...data.find((item) => item.kind === 1), spans }

	return mainTrace
})

export const Route = createFileRoute("/trace/$id")({
	component: RouteComponent,
	loader: async ({ params }) => getTrace(params.id),
})

function RouteComponent() {
	const data = Route.useLoaderData()
	console.log(data)
	return (
		<Container>
			<Card>{data.name}</Card>
		</Container>
	)
}
