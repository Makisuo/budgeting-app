"use client"

import type * as React from "react"

import { useLocation } from "@tanstack/react-router"
import { IconAlbum, IconBrandApple, IconCreditCard, IconCube, IconDashboard, IconPlus, IconSettings } from "justd-icons"
import { type PlaidLinkOptions, usePlaidLink } from "react-plaid-link"
import { Link, Modal, Sidebar, useSidebar } from "~/components/ui"
import { Route, getBankAccounts } from "~/routes/_app"
import { ProfileMenu } from "./profile-menu"

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
	const { state } = useSidebar()
	const collapsed = state === "collapsed"

	return (
		<Sidebar {...props}>
			<Sidebar.Header>
				<Link
					className="flex items-center gap-x-2 group-data-[collapsible=dock]:size-10 group-data-[collapsible=dock]:justify-center"
					href="/"
				>
					<IconBrandApple className="size-5" />
					<strong className="font-medium group-data-[collapsible=dock]:hidden">Maple</strong>
				</Link>
			</Sidebar.Header>
			<Sidebar.Content>
				<Sidebar.Section>
					<SidebarItem icon={IconDashboard} href="/">
						Dashboard
					</SidebarItem>
					<SidebarItem icon={IconAlbum} href="/accounts">
						Accounts
					</SidebarItem>
					<SidebarItem icon={IconCreditCard} href="/subscriptions">
						Subscriptions
					</SidebarItem>
					<SidebarItem icon={IconSettings} href="/settings">
						Settings
					</SidebarItem>
				</Sidebar.Section>
				<Sidebar.Section title="Linked Accounts">
					<SidebarItem icon={IconCube} href="/accounts">
						All Bank Accounts
					</SidebarItem>
					<ConnectBankAccountItem />
				</Sidebar.Section>
			</Sidebar.Content>
			<Sidebar.Footer className="hidden items-center lg:flex lg:flex-row">
				<ProfileMenu collapsed={collapsed} />
			</Sidebar.Footer>
		</Sidebar>
	)
}

function useIsCurrentRoute(path: string): boolean {
	const location = useLocation()

	// Normalize paths by removing trailing slashes
	const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path
	const normalizedPathname = location.pathname.endsWith("/") ? location.pathname.slice(0, -1) : location.pathname

	return normalizedPathname === normalizedPath
}

export const SidebarItem = ({ href, ...rest }: React.ComponentProps<typeof Sidebar.Item>) => {
	const isMatch = useIsCurrentRoute(href || "x.x")
	return <Sidebar.Item isCurrent={isMatch} href={href} {...rest} />
}

const ConnectBankAccountItem = () => {
	// const getTime = useServerFn(getBankAccounts)

	// const timeQuery = useQuery({
	//   queryKey: 'time',
	//   queryFn: () => getTime(),
	// })

	const { auth } = Route.useRouteContext()

	const { linkToken } = Route.useLoaderData()

	const config = {
		token: linkToken,
		onEvent: (event) => {
			console.log(event)
		},
		onSuccess: async (publicToken, metadata) => {
			const res = await fetch("http://localhost:8787/exchange-token", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${auth.session.id}`,
				},

				body: JSON.stringify({ publicToken: publicToken }),
			})

			console.log(await res.text())
		},
	} as PlaidLinkOptions

	const { open, ready } = usePlaidLink(config)

	return (
		<Sidebar.Item onPress={() => open()} isDisabled={!ready} icon={IconPlus}>
			Connect Bank Account
		</Sidebar.Item>
	)
}
