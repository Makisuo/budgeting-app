import { createFileRoute } from "@tanstack/react-router"
import * as React from "react"

export const Route = createFileRoute("/__app/settings")({
	component: RouteComponent,
})

function RouteComponent() {
	return "Hello /__app/settings!"
}
