import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/start"
import { IconChevronLgDown, IconCirclePerson, IconLogout, IconSearch, IconSettings, IconShield } from "justd-icons"
import { getWebRequest } from "vinxi/http"
import { AppSidebar } from "~/components/app-sidebar"
import { ProfileMenu } from "~/components/profile-menu"
import { Button, Sidebar } from "~/components/ui"
import { Avatar } from "~/components/ui/avatar"
import { Menu } from "~/components/ui/menu"
import { Separator } from "~/components/ui/separator"
import { auth } from "~/utils/auth"

export const authMiddleware = createServerFn("POST", async () => {
	const request = getWebRequest()

	const session = await auth.api.getSession({
		headers: request.headers,
	})

	if (!session) {
		throw redirect({ to: "/auth/signin" })
	}

	return session
})

export const Route = createFileRoute("/__app")({
	component: RouteComponent,
	loader: async () => {
		await authMiddleware()
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
