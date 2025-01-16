"use client"

import { useMatchRoute, useRouter } from "@tanstack/react-router"
import { useMemo } from "react"
import { Breadcrumbs, Separator, SidebarItem as SidebarItemPrimitive, SidebarNav, SidebarTrigger } from "ui"
import { useSession } from "~/lib/auth/auth-client"

export function AppSidebarNav() {
	return (
		<SidebarNav>
			<span className="flex items-center gap-x-4">
				<SidebarTrigger className="-mx-2" />
				<Separator className="@md:block hidden h-6" orientation="vertical" />

				{/* <Breadcrumbs className="@md:flex hidden">
					{pathname
						.split("/")
						.filter((path) => path)
						.map((path, index, arr) => {
							const href = `/${arr.slice(0, index + 1).join("/")}`
							return (
								<Breadcrumbs.Item
									className="capitalize"
									key={index}
									href={index === arr.length - 1 ? undefined : href}
								>
									{path.charAt(0).toUpperCase() + path.slice(1).replace("-", " ")}
								</Breadcrumbs.Item>
							)
						})}
				</Breadcrumbs> */}
			</span>

			<div className="ml-auto flex items-center gap-x-2">{/* {session && <UserNotifications />} */}</div>
		</SidebarNav>
	)
}

export const SidebarItem = ({ href, ...rest }: React.ComponentProps<typeof SidebarItemPrimitive>) => {
	const matchRoute = useMatchRoute()

	const isMatch = matchRoute({ to: href })

	return <SidebarItemPrimitive isCurrent={!!isMatch} href={href} {...rest} />
}
