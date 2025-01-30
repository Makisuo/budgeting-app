import { RouterProvider, createRouter } from "@tanstack/react-router"
import ReactDOM from "react-dom/client"
import { routeTree } from "./routeTree.gen"

import "./index.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { StrictMode } from "react"

import "@fontsource/geist-sans/400.css"
import "@fontsource-variable/geist-mono"

const queryClient = new QueryClient()

const router = createRouter({
	routeTree,
	context: {
		queryClient,
	},
	defaultPreload: "intent",
	defaultPreloadStaleTime: 0,
})

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router
	}
}

const InnerApp = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	)
}

const rootElement = document.getElementById("app")!
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement)
	root.render(
		<StrictMode>
			<InnerApp />
		</StrictMode>,
	)
}
