import { createFileRoute } from "@tanstack/react-router"
import { LoginCard } from "./-components/login-card"

export const Route = createFileRoute("/auth/login/")({
	component: RouteComponent,
})

function RouteComponent() {
	return <LoginCard />
}
