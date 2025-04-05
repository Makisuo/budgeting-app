import createFetchClient, { type Middleware } from "openapi-fetch"
import createClient from "openapi-react-query"
import type { paths } from "./v1"

export const useApi = () => {
	const authMiddleware: Middleware = {
		async onRequest({ request }) {
			return request
		},
	}

	const fetchClient = createFetchClient<paths>({
		credentials: "include",
		baseUrl: `${import.meta.env.VITE_BASE_URL}/api`,
	})

	fetchClient.use(authMiddleware)

	const $api = createClient(fetchClient)

	return $api
}
