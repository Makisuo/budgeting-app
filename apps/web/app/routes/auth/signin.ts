import { type NavigateFn, createFileRoute, redirect, useRouter } from "@tanstack/react-router"
import { useEffect } from "react"
import { signIn, useSession } from "~/utils/auth-client"

export const Route = createFileRoute("/auth/signin")({
	component: RouteComponent,
})

const signInHandler = async (navigate: NavigateFn) => {
	const res = await signIn.social({ provider: "github", callbackURL: "/" })

	if (res.error) {
		throw new Error(res.error.message)
	}

	if (!res.data) {
		throw new Error("No data returned from signIn.social")
	}

	throw navigate({ to: res.data.url })
}

function RouteComponent() {
	const { data, isPending } = useSession()

	const { navigate } = useRouter()
	useEffect(() => {
		if (!isPending) {
			if (data.user) {
				signInHandler(navigate)
			}
		}
	}, [navigate, data, isPending])

	return "Hello /auth/signin!"
}
