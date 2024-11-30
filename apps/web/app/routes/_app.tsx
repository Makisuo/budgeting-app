import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { createLinkTokenAction } from "~/actions"
import { AppSidebar } from "~/components/app-sidebar"
import { ProfileMenu } from "~/components/profile-menu"
import { Container, Sidebar } from "~/components/ui"

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
	loader: async () => {
		const res = await createLinkTokenAction()

		if (!res.link_token) {
			throw new Error("Error creating link token")
		}

		return {
			linkToken: res.link_token,
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
				<Container className="overflow-hidden p-4 lg:p-6">
					<Outlet />
				</Container>
			</Sidebar.Inset>
		</Sidebar.Provider>
	)
}
