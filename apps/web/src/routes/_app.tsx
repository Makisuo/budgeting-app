import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { AppSidebar } from "~/components/app-sidebar"
import { AppSidebarNav } from "~/components/app-sidebar-nav"
import { Container, SidebarInset, SidebarProvider } from "~/components/ui"
import { authQueryOptions } from "~/lib/auth/use-auth"
import { PgLiteProvider } from "~/utils/pglite/pglite.provider"

export const Route = createFileRoute("/_app")({
	component: () => {
		return <RouteComponent />
	},

	beforeLoad: async ({ context, location }) => {
		const session = await context.queryClient.ensureQueryData(authQueryOptions)

		if (!session) {
			throw redirect({
				to: "/auth/login",
				search: {
					redirect: location.href,
				},
			})
		}
	},
})

function RouteComponent() {
	return (
		<PgLiteProvider>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<AppSidebarNav />
					<Container className="flex flex-col gap-3 overflow-hidden p-4 lg:p-6">
						<Outlet />
					</Container>
				</SidebarInset>
			</SidebarProvider>
		</PgLiteProvider>
	)
}
