import { Outlet, ScrollRestoration, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"
import { Body, Head, Html, Meta, Scripts, createServerFn } from "@tanstack/start"
import type * as React from "react"
import { getWebRequest } from "vinxi/http"
import { DefaultCatchBoundary } from "~/components/default-catch-boundary"
import { NotFound } from "~/components/not-found"
import { Providers } from "~/components/providers"
import appCss from "~/styles/app.css?url"
import { auth } from "~/utils/auth"

import { seo } from "~/utils/seo"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

export const fetchUserSession = createServerFn("POST", async () => {
	const request = getWebRequest()

	const session = await auth.api.getSession({
		headers: request.headers,
	})

	return session
})

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
	beforeLoad: async () => {
		const auth = await fetchUserSession()

		return {
			auth,
		}
	},
	component: RootComponent,
})

function RootComponent() {
	return (
		<RootDocument>
			<QueryClientProvider client={queryClient}>
				<Providers>
					<Outlet />
				</Providers>
			</QueryClientProvider>
		</RootDocument>
	)
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<Html>
			<Head>
				<Meta />
			</Head>
			<Body>
				{children}
				<ScrollRestoration />
				<TanStackRouterDevtools position="bottom-right" />
				<Scripts />
			</Body>
		</Html>
	)
}
