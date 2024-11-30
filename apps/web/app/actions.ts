import { createServerFn } from "@tanstack/start"
import { CountryCode, Products } from "plaid"
import { getWebRequest, setResponseStatus } from "vinxi/http"
import { plaidClient } from "./routes/api/plaid/create-link-token"

import { getAuth } from "@clerk/tanstack-start/server"

export const createLinkTokenAction = createServerFn({ method: "POST" }).handler(async () => {
	const session = await fetchUserSession()

	if (!session.user.userId) {
		throw new Error("Unauthorized")
	}

	try {
		const tokenResponse = await plaidClient.linkTokenCreate({
			user: { client_user_id: session.user.userId },
			client_name: "Maple",
			webhook: `${process.env.VITE_APP_BACKEND_URL}/webhook`,
			products: [Products.Transactions],
			country_codes: [CountryCode.De],
			language: "en",
		})

		setResponseStatus(200)
		return { link_token: tokenResponse.data.link_token }
	} catch (error: any) {
		console.error("Error creating link token:", error)
		setResponseStatus(500)
		throw new Error("Error creating link token")
	}
})

export const fetchUserSession = createServerFn({ method: "GET" }).handler(async () => {
	const user = await getAuth(getWebRequest())

	return {
		user,
	}
})
