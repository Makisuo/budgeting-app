"use client"

import { IconAlbum, IconCreditCard, IconCube, IconDashboard, IconGear, IconPeople, IconPlus } from "justd-icons"
import { useState } from "react"
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
import { useDrizzleLive } from "~/utils/pglite/drizzle-client"
import { AppSidebarLogo } from "./app-sidebar-logo"
import { SidebarItem } from "./app-sidebar-nav"
import { BankConnector } from "./bank-connector"
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
						<SidebarItem href="/">
							<IconDashboard />
							Dashboard
						</SidebarItem>
						<SidebarItem href="/accounts">
							<IconAlbum />
							Accounts
						</SidebarItem>
						<SidebarItem href="/subscriptions">
							<IconCreditCard />
							Subscriptions
						</SidebarItem>
					</SidebarSection>
					<SidebarSection title="Linked Accounts">
						<SidebarItem href="/accounts">
							<IconCube />
							All Bank Accounts
						</SidebarItem>
						<AccountItems />
						<ConnectBankAccountItem />
					</SidebarSection>
					<SidebarDisclosure defaultExpanded>
						<SidebarDisclosureTrigger>
							<SidebarLabel>Settings</SidebarLabel>
						</SidebarDisclosureTrigger>
						<SidebarDisclosurePanel>
							<SidebarItem href="/settings">
								<IconGear />
								<SidebarLabel>Settings</SidebarLabel>
							</SidebarItem>

							<SidebarItem href="/settings/billings">
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

const AccountItems = () => {
	const { data: accounts } = useDrizzleLive((db) =>
		db.query.accounts.findMany({
			limit: 100,
			with: {
				institution: true,
			},
		}),
	)

	return (
		<>
			{accounts.map((account) => (
				<SidebarItem key={account.id} href={`/accounts/${account.id}` as "/accounts/$accountId"}>
					{account.institution?.logo ? (
						<img className="size-4" src={account.institution.logo!} alt={account.institution.name} />
					) : (
						<IconCube />
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
			<SidebarItem onPress={() => setIsOpen((open) => !open)}>
				<IconPlus />
				Connect Bank Account
			</SidebarItem>
			<BankConnector isOpen={isOpen} setIsOpen={setIsOpen} />
		</>
	)
}
