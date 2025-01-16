import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { AppSidebar } from "~/components/app-sidebar"
import { AppSidebarNav } from "~/components/app-sidebar-nav"
import { Container, SidebarInset, SidebarProvider } from "~/components/ui"
import { PgLiteProvider } from "~/utils/pglite/pglite.provider"

export const Route = createFileRoute("/_app")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		if (!context.auth.userId) {
			throw redirect({
				to: "/auth/login",
			})
		}

		return {
			auth: context.auth,
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
					<Container className="overflow-hidden p-4 lg:p-6">
						<Outlet />
					</Container>
				</SidebarInset>
			</SidebarProvider>
		</PgLiteProvider>
	)
}
