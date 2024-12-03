import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/subscriptions")({
	component: RouteComponent,
})

function RouteComponent() {
	return "Hello /_app/subscriptions!"
}
