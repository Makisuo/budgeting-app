import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { AppSidebar } from "~/components/app-sidebar"
import { ProfileMenu } from "~/components/profile-menu"
import { Container, Sidebar } from "~/components/ui"
import { PgLiteProvider } from "~/utils/pglite/pglite.provider"

export const Route = createFileRoute("/_app")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		if (!context.auth.userId) {
			throw redirect({
				to: "/auth/signin/$",
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
			<Sidebar.Provider>
				<AppSidebar />
				<Sidebar.Inset>
					<Sidebar.Nav isSticky>
						<span className="flex items-center gap-x-3">
							<Sidebar.Trigger className="-mx-2" />
						</span>
						<div className="flex items-center gap-x-2 sm:hidden">
							<ProfileMenu />
						</div>
					</Sidebar.Nav>
					<Container className="overflow-hidden p-4 lg:p-6">
						<Outlet />
					</Container>
				</Sidebar.Inset>
			</Sidebar.Provider>
		</PgLiteProvider>
	)
}
