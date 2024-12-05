"use client"

import type * as React from "react"

import { useMatchRoute } from "@tanstack/react-router"
import { IconAlbum, IconBrandApple, IconCreditCard, IconCube, IconDashboard, IconPlus, IconSettings } from "justd-icons"
import { useMemo, useState } from "react"

import { Link, Sidebar, useSidebar } from "~/components/ui"
import { useDrizzleLive } from "~/lib/hooks/use-drizzle-live"
import { BankConnector } from "./bank-connector"
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
					{/* <IconBrandApple className="size-5" /> */}
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

export const SidebarItem = ({ href, ...rest }: React.ComponentProps<typeof Sidebar.Item>) => {
	const matchRoute = useMatchRoute()

	const isMatch = matchRoute({ to: href })

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	return useMemo(() => <Sidebar.Item isCurrent={!!isMatch} href={href} {...rest} />, [isMatch, href])
}

const AccountItems = () => {
	const { data: accounts } = useDrizzleLive((db) =>
		db.query.accounts.findMany({
			limit: 100,
			with: {
				institution: true,
			},
		}),
	)

	console.log(accounts)

	return (
		<>
			{accounts.map((account) => (
				<SidebarItem
					icon={IconCube}
					key={account.id}
					href={`/accounts/${account.id}` as "/accounts/$accountId"}
				>
					{account.institution?.logo && (
						<img className="h-3 pr-2" src={account.institution.logo} alt={account.institution.name} />
					)}
					{account.institution.name} {account.type}
				</SidebarItem>
			))}
		</>
	)
}

const ConnectBankAccountItem = () => {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<>
			<Sidebar.Item icon={IconPlus} onPress={() => setIsOpen((open) => !open)}>
				Connect Bank Account
			</Sidebar.Item>
			<BankConnector isOpen={isOpen} setIsOpen={setIsOpen} />
		</>
	)
}
