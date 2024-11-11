import { createFileRoute } from "@tanstack/react-router"
import * as React from "react"

export const Route = createFileRoute("/auth/register")({
	component: RouteComponent,
})

function RouteComponent() {
	return "Hello /auth/register!"
}
