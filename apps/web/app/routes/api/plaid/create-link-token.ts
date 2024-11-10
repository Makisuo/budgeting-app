import { json } from "@tanstack/start"
import { createAPIFileRoute } from "@tanstack/start/api"

import { Configuration, CountryCode, PlaidApi, PlaidEnvironments, Products } from "plaid"

const configuration = new Configuration({
	basePath: PlaidEnvironments[process.env.PLAID_ENV!],
	baseOptions: {
		headers: {
			"PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
			"PLAID-SECRET": process.env.PLAID_SECRET,
		},
	},
})

export const plaidClient = new PlaidApi(configuration)

export const Route = createAPIFileRoute("/api/plaid/create-link-token")({
	GET: async ({ request, params }) => {
		try {
			const tokenResponse = await plaidClient.linkTokenCreate({
				user: { client_user_id: "unique-user-id" }, // Replace with actual user ID
				client_name: "Maple",
				products: [Products.Transactions],
				country_codes: [CountryCode.De],
				language: "en",
			})

			return json({ link_token: tokenResponse.data.link_token })
		} catch (error: any) {
			console.error("Error creating link token:", error)
			return json({ error: error.message }, { status: 500 })
		}
	},
})
