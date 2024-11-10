import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/start"
import { EventTable } from "~/components/event-table"
import { clickhouseClient } from "~/utils/clickhouse"
import type { Span } from "~/utils/types"

export const getEvents = createServerFn("GET", async () => {
	const resultSet = await clickhouseClient.query({
		query: "SELECT * FROM traces LIMIT 50",
		format: "JSONEachRow",
	})

	const data = (await resultSet.json()) as Span[]

	return data
})

export const Route = createFileRoute("/events")({
	component: EventsPage,
	loader: async () => getEvents(),
})

function EventsPage() {
	const data = Route.useLoaderData()
	return <EventTable spans={data} />
}
