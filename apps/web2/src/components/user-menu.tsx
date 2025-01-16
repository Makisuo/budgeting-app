import { useNavigate } from "@tanstack/react-router"
import { IconChevronLgDown, IconDashboard, IconLogout, IconPeople, IconSettings } from "justd-icons"
import { Avatar, Menu, SidebarLabel } from "ui"
import { signOut, useSession } from "~/lib/auth/auth-client"

export const UserMenu = () => {
	const navigate = useNavigate()

	const { data: session } = useSession()

	return (
		<Menu>
			<Menu.Trigger className="group" aria-label="Profile" data-slot="menu-trigger">
				<Avatar
					shape="square"
					src={session?.user.image}
					alt={session?.user.name}
					initials={session?.user.name.split(" ").join("").slice(0, 2)}
				/>
				<div className="in-data-[sidebar-collapsible=dock]:hidden text-sm">
					<SidebarLabel>{session?.user.name}</SidebarLabel>
					<span className="-mt-0.5 block text-muted-fg">{session?.user.email}</span>
				</div>
				<IconChevronLgDown
					data-slot="chevron"
					className="absolute right-3 size-4 transition-transform group-pressed:rotate-180"
				/>
			</Menu.Trigger>
			<Menu.Content placement="bottom right" className="sm:min-w-(--trigger-width)">
				<Menu.Section>
					<Menu.Header separator>
						<span className="block">{session?.user.name}</span>
					</Menu.Header>
				</Menu.Section>

				<Menu.Item href="/dashboard">
					<IconDashboard />
					Dashboard
				</Menu.Item>
				<Menu.Item href="/dashboard/settings">
					<IconSettings />
					Settings
				</Menu.Item>
				<Menu.Separator />
				<Menu.Item href="/dashboard/settings/team">
					<IconPeople />
					Teams
				</Menu.Item>
				<Menu.Separator />
				<Menu.Item
					onAction={async () =>
						await signOut({
							fetchOptions: {
								onSuccess: () => {
									navigate({
										to: "/auth/login",
									})
								},
							},
						})
					}
				>
					<IconLogout />
					Log out
				</Menu.Item>
			</Menu.Content>
		</Menu>
	)
}
