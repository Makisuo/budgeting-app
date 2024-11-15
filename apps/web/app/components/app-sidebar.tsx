"use client"

import type * as React from "react"

import { useLocation } from "@tanstack/react-router"
import { IconAlbum, IconBrandApple, IconCreditCard, IconCube, IconDashboard, IconPlus, IconSettings } from "justd-icons"
import { type PlaidLinkOptions, usePlaidLink } from "react-plaid-link"
import { Link, Loader, Sidebar, useSidebar } from "~/components/ui"
import { Route } from "~/routes/_app"
import { useBankAccounts } from "~/utils/electric/hooks"
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
					<AccountItems />
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

const AccountItems = () => {
	const { data } = useBankAccounts()

	return (
		<>
			{data.map((item) => (
				<SidebarItem icon={IconCube} key={item.id} href={`/accounts/${item.id}` as "/accounts/$accountId"}>
					{item.name}
				</SidebarItem>
			))}
		</>
	)
}

const ConnectBankAccountItem = () => {
	const { auth } = Route.useRouteContext()

	const { linkToken } = Route.useLoaderData()

	console.log(linkToken)

	const config = {
		token: linkToken,
		onEvent: (event) => {
			console.log(event)
		},
		onSuccess: async (publicToken, metadata) => {
			const res = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/exchange-token`, {
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

	const { open, ready, error } = usePlaidLink(config)

	console.log(error, ready)
	return (
		<Sidebar.Item onPress={() => open()} isDisabled={!ready} icon={IconPlus}>
			Connect Bank Account
		</Sidebar.Item>
	)
}
