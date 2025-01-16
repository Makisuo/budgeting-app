import { Outlet, createFileRoute } from "@tanstack/react-router"
import { Link } from "react-aria-components"

export const Route = createFileRoute("/auth")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="w-full max-w-md p-4">
				<Link href="/" className="mb-2 inline-block font-mono text-muted-fg text-xs uppercase hover:text-fg">
					Maple budget
				</Link>
				<Outlet />
			</div>
		</div>
	)
}
