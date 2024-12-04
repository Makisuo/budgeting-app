import { Outlet, ScrollRestoration, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"
import { Meta, Scripts } from "@tanstack/start"
import type * as React from "react"
import { DefaultCatchBoundary } from "~/components/default-catch-boundary"
import { NotFound } from "~/components/not-found"
import { Providers } from "~/components/providers"

import { ClerkProvider } from "@clerk/tanstack-start"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fetchUserSession } from "~/actions"

import { useEffect } from "react"
import appCss from "~/styles/app.css?url"

import { scan } from "react-scan"

const queryClient = new QueryClient()

export const Route = createRootRoute({
	head: () => ({
		links: [
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
	}),
	errorComponent: (props) => {
		return (
			<RootDocument>
				<DefaultCatchBoundary {...props} />
			</RootDocument>
		)
	},
	notFoundComponent: () => <NotFound />,
	beforeLoad: async () => {
		const auth = await fetchUserSession()

		return {
			auth: auth,
		}
	},
	component: RootComponent,
})

function RootComponent() {
	useEffect(() => {
		scan({
			enabled: import.meta.env.DEV,
			log: true,
			includeChildren: true,
			report: true,
		})
	}, [])

	return (
		<ClerkProvider>
			<RootDocument>
				<QueryClientProvider client={queryClient}>
					<Providers>
						<Outlet />
					</Providers>
				</QueryClientProvider>
			</RootDocument>
		</ClerkProvider>
	)
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<Meta />
			</head>
			<body>
				{children}
				<ScrollRestoration />

				<TanStackRouterDevtools position="bottom-left" />
				<Scripts />
			</body>
		</html>
	)
}
