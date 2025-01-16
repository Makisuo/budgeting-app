import type { QueryClient } from "@tanstack/react-query"
import { Outlet, createRootRoute, createRootRouteWithContext } from "@tanstack/react-router"
import { Providers } from "~/components/providers"
import { Toast } from "~/components/ui"

interface RootRouteContext {
	queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
	component: RootComponent,
})

function RootComponent() {
	return (
		<Providers>
			<Toast />
			<Outlet />
		</Providers>
	)
}
