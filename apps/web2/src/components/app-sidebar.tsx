"use client"

import { IconCreditCard, IconDashboard, IconGear, IconPeople } from "justd-icons"
import {
	Sidebar,
	SidebarContent,
	SidebarDisclosure,
	SidebarDisclosurePanel,
	SidebarDisclosureTrigger,
	SidebarFooter,
	SidebarHeader,
	SidebarLabel,
	SidebarRail,
	SidebarSection,
	SidebarSectionGroup,
} from "ui"
import { useSession } from "~/lib/auth/auth-client"
import { AppSidebarLogo } from "./app-sidebar-logo"
import { SidebarItem } from "./app-sidebar-nav"
import { UserMenu } from "./user-menu"

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
	const { data: session } = useSession()

	return (
		<Sidebar {...props}>
			<SidebarHeader>
				<AppSidebarLogo />
			</SidebarHeader>
			<SidebarContent>
				<SidebarSectionGroup>
					<SidebarSection title="Overview">
						<SidebarItem href="/dashboard">
							<IconDashboard />
							<SidebarLabel>Dashboard</SidebarLabel>
						</SidebarItem>
					</SidebarSection>
					<SidebarDisclosure defaultExpanded>
						<SidebarDisclosureTrigger>
							<SidebarLabel>Settings</SidebarLabel>
						</SidebarDisclosureTrigger>
						<SidebarDisclosurePanel>
							<SidebarItem href="/dashboard/settings">
								<IconGear />
								<SidebarLabel>Profile</SidebarLabel>
							</SidebarItem>

							<SidebarItem href="/dashboard/settings/billings">
								<IconCreditCard />
								<SidebarLabel>Billings</SidebarLabel>
							</SidebarItem>
						</SidebarDisclosurePanel>
					</SidebarDisclosure>
					{session?.user.role === "admin" && (
						<SidebarDisclosure defaultExpanded>
							<SidebarDisclosureTrigger>
								<SidebarLabel>Admin</SidebarLabel>
							</SidebarDisclosureTrigger>
							<SidebarDisclosurePanel>
								<SidebarItem href="/dashboard/admin/users">
									<IconPeople />
									<SidebarLabel>Users</SidebarLabel>
								</SidebarItem>
							</SidebarDisclosurePanel>
						</SidebarDisclosure>
					)}
				</SidebarSectionGroup>
			</SidebarContent>

			<SidebarFooter className="space-y-3">
				<UserMenu />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
