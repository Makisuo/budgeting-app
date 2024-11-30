import { useAuth } from "@clerk/clerk-react"
import createFetchClient, { type Middleware } from "openapi-fetch"
import createClient from "openapi-react-query"
import type { paths } from "./v1"

export const useApi = () => {
	const { getToken } = useAuth()

	const authMiddleware: Middleware = {
		async onRequest({ request }) {
			request.headers.set("Authorization", `Bearer ${await getToken()}`)
			return request
		},
	}

	const fetchClient = createFetchClient<paths>({
		baseUrl: import.meta.env.VITE_APP_BACKEND_URL,
	})

	fetchClient.use(authMiddleware)

	const $api = createClient(fetchClient)

	return $api
}
