import { Outlet, ScrollRestoration, createRootRoute, useRouter } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"
import { Body, Head, Html, Meta, Scripts } from "@tanstack/start"
import type * as React from "react"
import { useEffect } from "react"
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary"
import { NotFound } from "~/components/NotFound"
import { Providers } from "~/components/providers"
import appCss from "~/styles/app.css?url"
import { useSession } from "~/utils/auth-client"
import { seo } from "~/utils/seo"

export const Route = createRootRoute({
	meta: () => [
		{
			charSet: "utf-8",
		},
		{
			name: "viewport",
			content: "width=device-width, initial-scale=1",
		},
		...seo({
			title: "TanStack Start | Type-Safe, Client-First, Full-Stack React Framework",
			description: "TanStack Start is a type-safe, client-first, full-stack React framework. ",
		}),
	],
	links: () => [
		{ rel: "stylesheet", href: appCss },
		{
			rel: "apple-touch-icon",
			sizes: "180x180",
			href: "/apple-touch-icon.png",
		},
		{
			rel: "icon",
			type: "image/png",
			sizes: "32x32",
			href: "/favicon-32x32.png",
		},
		{
			rel: "icon",
			type: "image/png",
			sizes: "16x16",
			href: "/favicon-16x16.png",
		},
		{ rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
		{ rel: "icon", href: "/favicon.ico" },
	],
	errorComponent: (props) => {
		return (
			<RootDocument>
				<DefaultCatchBoundary {...props} />
			</RootDocument>
		)
	},
	notFoundComponent: () => <NotFound />,
	component: RootComponent,
})

function RootComponent() {
	return (
		<RootDocument>
			<Providers>
				<Outlet />
			</Providers>
		</RootDocument>
	)
}

function RootDocument({ children }: { children: React.ReactNode }) {
	const { data } = useSession()
	const { navigate } = useRouter()

	useEffect(() => {
		if (!data?.user) {
			if (!location.pathname.includes("auth/")) {
				navigate({ to: "/auth/signin" })
			}
		}
	}, [data, navigate])

	return (
		<Html>
			<Head>
				<Meta />
			</Head>
			<Body>
				<div className="px-2 pt-4">{children}</div>
				<ScrollRestoration />
				<TanStackRouterDevtools position="bottom-right" />
				<Scripts />
			</Body>
		</Html>
	)
}
