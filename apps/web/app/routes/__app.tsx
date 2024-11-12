import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { AppSidebar } from "~/components/app-sidebar"
import { ProfileMenu } from "~/components/profile-menu"
import { Sidebar } from "~/components/ui"

export const Route = createFileRoute("/__app")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		if (!context.auth) {
			throw redirect({ to: "/auth/signin" })
		}

		return {
			auth: context.auth,
		}
	},
})

function RouteComponent() {
	return (
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
				<div className="overflow-hidden p-4 lg:p-6">
					<Outlet />
				</div>
			</Sidebar.Inset>
		</Sidebar.Provider>
	)
}
