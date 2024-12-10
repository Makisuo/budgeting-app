import { createFileRoute } from "@tanstack/react-router"
import { useDrizzleLive } from "~/lib/hooks/use-drizzle-live"

export const Route = createFileRoute("/_app/subscriptions")({
	component: RouteComponent,
})

function RouteComponent() {
	const { data: transactions } = useDrizzleLive((db) => db.query.transactions.findMany({}))

	console.log(transactions)

	return "Hello /_app/subscriptions!"
}
