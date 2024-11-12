import { json } from "@tanstack/start"
import { createAPIFileRoute } from "@tanstack/start/api"
import { schema } from "db"
import { auth } from "~/utils/auth"
import { db } from "~/utils/db"
import { plaidClient } from "./create-link-token"

export const Route = createAPIFileRoute("/api/plaid/exchange-token")({
	POST: async ({ request }) => {
		try {
			const session = await auth.api.getSession({
				headers: request.headers,
			})

			if (!session) {
				return json({ error: "Unauthorized" }, { status: 401 })
			}

			const requestBody = await request.json()
			const { publicToken } = requestBody

			const tokenResponse = await plaidClient.itemPublicTokenExchange({
				public_token: publicToken,
			})

			// Store this access_token securely in your database
			const accessToken = tokenResponse.data.access_token
			const itemId = tokenResponse.data.item_id

			await db.insert(schema.plaidItem).values({
				id: itemId,
				accessToken: accessToken,
				userId: session.user.id,
			})

			const accounts = await plaidClient.accountsGet({ access_token: accessToken })

			// Here you would typically save the access token to your database
			// await db.saveAccessToken(userId, accessToken);

			return json({ success: true, accessToken })
		} catch (error: any) {
			console.error("Error exchanging token:", error)
			return json({ error: error.message }, { status: 500 })
		}
	},
})
