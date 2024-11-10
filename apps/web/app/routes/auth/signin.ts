import { createFileRoute } from "@tanstack/react-router"
import { signIn } from "~/utils/auth-client"

export const Route = createFileRoute("/auth/signin")({
	component: RouteComponent,
	loader: async () => {
		await signIn.social({ provider: "github", callbackURL: "/" })
	},
})

function RouteComponent() {
	return "Hello /auth/signin!"
}
