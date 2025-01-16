import type { QueryClient } from "@tanstack/react-query"
import { Outlet, createRootRoute, createRootRouteWithContext } from "@tanstack/react-router"
import { useAtom } from "jotai"
import { Providers } from "~/components/providers"
import { RandomCat } from "~/components/random-cat"
import { Toast } from "~/components/ui"
import { catModeAtom } from "./_app/settings"

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
			<CatMode />
			<Outlet />
		</Providers>
	)
}

const CatMode = () => {
	const [catMode, setCatMode] = useAtom(catModeAtom)

	if (!catMode) {
		return <></>
	}

	return <RandomCat />
}
