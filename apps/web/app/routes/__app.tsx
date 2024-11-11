import { Outlet, createFileRoute } from "@tanstack/react-router"
import { IconChevronLgDown, IconCirclePerson, IconLogout, IconSearch, IconSettings, IconShield } from "justd-icons"
import { AppSidebar } from "~/components/app-sidebar"
import { Button, Sidebar } from "~/components/ui"
import { Avatar } from "~/components/ui/avatar"
import { Menu } from "~/components/ui/menu"
import { Separator } from "~/components/ui/separator"

export const Route = createFileRoute("/__app")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<Sidebar.Provider>
			<AppSidebar />
			<Sidebar.Inset>
				<Sidebar.Nav isSticky>
					<span className="flex items-center gap-x-3">
						<Sidebar.Trigger className="-mx-2" />
						<Separator className="h-6 sm:block hidden" orientation="vertical" />
					</span>
					<div className="flex sm:hidden items-center gap-x-2">
						<Button appearance="plain" aria-label="Search..." size="square-petite">
							<IconSearch />
						</Button>
						<Menu>
							<Menu.Trigger aria-label="Profile" className="flex items-center gap-x-2 group">
								<Avatar size="small" shape="circle" src="/images/sidebar/profile-slash.jpg" />
								<IconChevronLgDown className="size-4 group-pressed:rotate-180 transition-transform" />
							</Menu.Trigger>
							<Menu.Content className="min-w-[--trigger-width]">
								<Menu.Item href="#">
									<IconCirclePerson />
									Profile
								</Menu.Item>
								<Menu.Item href="#">
									<IconSettings />
									Settings
								</Menu.Item>
								<Menu.Item href="#">
									<IconShield />
									Security
								</Menu.Item>
								<Menu.Item href="#">
									<IconLogout />
									Log out
								</Menu.Item>
							</Menu.Content>
						</Menu>
					</div>
				</Sidebar.Nav>
				<div className="p-4 lg:p-6 overflow-hidden">
					<Outlet />
				</div>
			</Sidebar.Inset>
		</Sidebar.Provider>
	)
}
