import { createServerFn } from "@tanstack/start"
import { CountryCode, Products } from "plaid"
import { getWebRequest, setResponseStatus } from "vinxi/http"
import { plaidClient } from "./routes/api/plaid/create-link-token"
import { auth } from "./utils/auth"
import { db } from "./utils/db"

export const createLinkToken = createServerFn({ method: "POST" }).handler(async () => {
	const session = await fetchUserSession()

	if (!session?.user) {
		throw new Error("Unauthorized")
	}

	try {
		const tokenResponse = await plaidClient.linkTokenCreate({
			user: { client_user_id: session.user.id }, // Replace with actual user ID
			client_name: "Maple",
			webhook: `${import.meta.env.VITE_APP_BACKEND_URL}/webhook`,
			products: [Products.Transactions],
			country_codes: [CountryCode.De],
			language: "en",
		})

		return { link_token: tokenResponse.data.link_token }
	} catch (error: any) {
		console.error("Error creating link token:", error)
		setResponseStatus(500)
		return { error: error.message, link_token: null }
	}
})

export const fetchUserSession = createServerFn().handler(async () => {
	const request = getWebRequest()

	const session = await auth.api.getSession({
		headers: request.headers,
	})

	return session
})

export const getBankAccount = createServerFn({ method: "GET" })
	.validator((input: string) => input)
	.handler(async ({ data }) => {
		const session = await fetchUserSession()

		if (!session) {
			throw new Error("Unauthorized")
		}

		const bankAccount = await db.query.bankAccount.findFirst({
			where: (table, { eq, and }) => and(eq(table.id, data), eq(table.userId, session.user.id)),
		})

		return bankAccount
	})
