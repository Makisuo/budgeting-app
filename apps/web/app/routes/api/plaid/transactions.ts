import { json } from "@tanstack/start"
import { createAPIFileRoute } from "@tanstack/start/api"
import type { TransactionsGetRequest } from "plaid"
import { plaidClient } from "./create-link-token"

export const Route = createAPIFileRoute("/api/plaid/transactions")({
	POST: async ({ request }) => {
		const { accessToken } = await request.json()
		try {
			const request: TransactionsGetRequest = {
				access_token: accessToken,
				start_date: "2024-01-01",
				end_date: "2024-11-11",
				options: {
					include_personal_finance_category: true,
				},
			}

			const response = await plaidClient.transactionsGet(request)
			const transactions = response.data.transactions

			return json(transactions)
		} catch (error: any) {
			return json({ error: error.message }, { status: 500 })
		}
	},
})
