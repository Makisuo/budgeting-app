import { useUser } from "@clerk/tanstack-start"
import { IconChevronLgDown, IconCirclePerson, IconLogout, IconMoon, IconSettings, IconSun } from "justd-icons"
import { useTheme } from "./theme-provider"
import { Avatar, Button, Menu } from "./ui"

export type ProfileMenuProps = {
	collapsed?: boolean
}

export const ProfileMenu = ({ collapsed = false }: ProfileMenuProps) => {
	const { theme, setTheme } = useTheme()

	const { user } = useUser()

	return (
		<Menu>
			<Button appearance="plain" aria-label="Profile" slot="menu-trigger" className="group w-full justify-start">
				<Avatar size="small" shape="square" src={user?.imageUrl} />
				<span className="flex items-center justify-center group-data-[collapsible=dock]:hidden">
					{user?.username}
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
					onAction={
						() => {}
						// TODO:
						// signOut({
						// 	fetchOptions: {
						// 		onSuccess: () => {
						// 			navigate({ to: "/auth/signin" }) // redirect to login page
						// 		},
						// 	},
						// })
					}
				>
					<IconLogout />
					Log out
				</Menu.Item>
			</Menu.Content>
		</Menu>
	)
}
