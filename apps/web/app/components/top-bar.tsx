import { useLocation, useMatch, useMatches, useRouter } from "@tanstack/react-router"
import {
	IconBag2,
	IconChevronLgDown,
	IconCommandRegular,
	IconDashboard,
	IconHeadphones,
	IconLogout,
	IconSearch,
	IconSettings,
} from "justd-icons"
import { Avatar } from "./ui/avatar"
import { Button } from "./ui/button"
import { Menu } from "./ui/menu"
import { Navbar } from "./ui/navbar"
import { Separator } from "./ui/separator"

export const Topbar = () => {
	const router = useRouter()

	const location = useLocation()

	return (
		<Navbar intent="floating">
			<Navbar.Nav>
				<Navbar.Logo href="/">Logo</Navbar.Logo>
				<Navbar.Section>
					<Navbar.Item href="/traces" isCurrent={location.pathname === "/traces"}>
						Traces
					</Navbar.Item>
					<Navbar.Item href="/events" isCurrent={location.pathname === "/events"}>
						Events
					</Navbar.Item>
				</Navbar.Section>
				<Navbar.Section className="ml-auto hidden sm:flex">
					<div className="flex items-center gap-x-2">
						<Button appearance="plain" size="square-petite" aria-label="Search for products">
							<IconSearch />
						</Button>
					</div>
					<Separator orientation="vertical" className="mr-3 ml-1 h-6" />
					<Menu>
						<Menu.Trigger aria-label="Open Menu" className="group gap-x-2 flex items-center">
							<Avatar alt="slash" size="small" shape="square" src="https://i.pravatar.cc/150" />
							<IconChevronLgDown className="size-4 transition-transform group-pressed:rotate-180" />
						</Menu.Trigger>
						<Menu.Content placement="bottom" showArrow className="sm:min-w-56">
							<Menu.Section>
								<Menu.Header separator>
									<span className="block">Irsyad A. Panjaitan</span>
									<span className="font-normal text-muted-fg">@irsyadadl</span>
								</Menu.Header>
							</Menu.Section>

							<Menu.Item href="#dashboard">
								<IconDashboard />
								Dashboard
							</Menu.Item>
							<Menu.Item href="#settings">
								<IconSettings />
								Settings
							</Menu.Item>
							<Menu.Separator />
							<Menu.Item>
								<IconCommandRegular />
								Command Menu
							</Menu.Item>
							<Menu.Separator />
							<Menu.Item href="#contact-s">
								<IconHeadphones />
								Contact Support
							</Menu.Item>
							<Menu.Separator />
							<Menu.Item href="#logout">
								<IconLogout />
								Log out
							</Menu.Item>
						</Menu.Content>
					</Menu>
				</Navbar.Section>
			</Navbar.Nav>
			<Navbar.Compact>
				<Navbar.Flex>
					<Navbar.Trigger className="-ml-2" />
				</Navbar.Flex>
				<Navbar.Flex>
					<Navbar.Flex>
						<Button appearance="plain" size="square-petite" aria-label="Search for products">
							<IconSearch />
						</Button>
						<Button appearance="plain" size="square-petite" aria-label="Your Bag">
							<IconBag2 />
						</Button>
					</Navbar.Flex>
				</Navbar.Flex>
			</Navbar.Compact>
		</Navbar>
	)
}
