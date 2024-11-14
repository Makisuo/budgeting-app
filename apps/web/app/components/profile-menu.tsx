import { useNavigate } from "@tanstack/react-router"
import {
	IconChevronLgDown,
	IconCirclePerson,
	IconLogout,
	IconMoon,
	IconSettings,
	IconShield,
	IconSun,
} from "justd-icons"
import { Route } from "~/routes/_app"
import { signOut } from "~/utils/auth-client"
import { useTheme } from "./theme-provider"
import { Avatar, Button, Menu } from "./ui"

export type ProfileMenuProps = {
	collapsed?: boolean
}

export const ProfileMenu = ({ collapsed = false }: ProfileMenuProps) => {
	const { auth } = Route.useRouteContext()
	const { theme, setTheme } = useTheme()

	const navigate = useNavigate()

	return (
		<Menu>
			<Button appearance="plain" aria-label="Profile" slot="menu-trigger" className="group">
				<Avatar size="small" shape="square" src={auth.user.image} />
				<span className="flex items-center justify-center group-data-[collapsible=dock]:hidden">
					{auth.user.name}
					<IconChevronLgDown className="absolute right-3 size-4 transition-transform group-pressed:rotate-180" />
				</span>
			</Button>
			<Menu.Content
				placement={collapsed ? "right" : "top"}
				className={collapsed ? "sm:min-w-56" : "min-w-[--trigger-width]"}
			>
				<Menu.Item href="/">
					<IconCirclePerson />
					Profile
				</Menu.Item>
				<Menu.Item href="/settings">
					<IconSettings />
					Settings
				</Menu.Item>

				<Menu.Separator />
				<Menu.Item onAction={() => setTheme(theme === "light" ? "dark" : "light")}>
					{theme === "light" ? <IconMoon /> : <IconSun />}
					Preferences
				</Menu.Item>
				<Menu.Separator />
				<Menu.Item
					onAction={() =>
						signOut({
							fetchOptions: {
								onSuccess: () => {
									navigate({ to: "/auth/signin" }) // redirect to login page
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
