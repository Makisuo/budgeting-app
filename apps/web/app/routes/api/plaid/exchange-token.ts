import { json } from "@tanstack/start"
import { createAPIFileRoute } from "@tanstack/start/api"
import { plaidClient } from "./create-link-token"

export const Route = createAPIFileRoute("/api/plaid/exchange-token")({
	POST: async ({ request, params }) => {
		try {
			const requestBody = await request.json()
			const { publicToken } = requestBody
			const tokenResponse = await plaidClient.itemPublicTokenExchange({
				public_token: publicToken,
			})

			// Store this access_token securely in your database
			const accessToken = tokenResponse.data.access_token

			// Here you would typically save the access token to your database
			// await db.saveAccessToken(userId, accessToken);

			return json({ success: true, accessToken })
		} catch (error: any) {
			console.error("Error exchanging token:", error)
			return json({ error: error.message }, { status: 500 })
		}
	},
})
