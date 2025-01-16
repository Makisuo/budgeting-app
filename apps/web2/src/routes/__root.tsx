import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Outlet, createRootRoute } from "@tanstack/react-router"
import { Providers } from "~/components/providers"

export const Route = createRootRoute({
	component: RootComponent,
})

const queryClient = new QueryClient()

function RootComponent() {
	return (
		<QueryClientProvider client={queryClient}>
			<Providers>
				<Outlet />
			</Providers>
		</QueryClientProvider>
	)
}
