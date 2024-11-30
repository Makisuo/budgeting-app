import { SignUp } from "@clerk/tanstack-start"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/auth/signup/$")({
	component: RouteComponent,
})

function RouteComponent() {
	return <SignUp />
}
