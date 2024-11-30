import { SignIn } from "@clerk/tanstack-start"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/auth/signin/$")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className="container mx-auto flex size-full min-h-screen items-center justify-center">
			<SignIn />
		</div>
	)
}
