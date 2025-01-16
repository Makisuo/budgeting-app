import { Link, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth")({
	component: AuthLayout,
})

function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="w-full max-w-md p-4">
				<Link to="/" className="mb-2 inline-block font-mono text-muted-fg text-xs uppercase hover:text-fg">
					Maple Budget
				</Link>
				{children}
			</div>
		</div>
	)
}
