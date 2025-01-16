"use client"

import { twJoin } from "tailwind-merge"
import { Logo } from "~/components/logo"
import { Link, SidebarLabel, useSidebar } from "~/components/ui"

export const AppSidebarLogo = () => {
	const { state } = useSidebar()

	return (
		<Link className={twJoin("flex items-center justify-center gap-x-2", state !== "collapsed" && "mb-4")} href="/">
			<Logo />
			<SidebarLabel className="font-mono text-xs uppercase">Maple</SidebarLabel>
		</Link>
	)
}
