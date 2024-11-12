import { createFileRoute } from "@tanstack/react-router"
import { createServerFn, json } from "@tanstack/start"
import { plaidClient } from "./api/plaid/create-link-token"

import { type PlaidLinkOptions, usePlaidLink } from "react-plaid-link"

import { CountryCode, Products } from "plaid"
import { Button } from "~/components/ui/button"
import { useSession } from "~/utils/auth-client"

const createLinkToken = createServerFn("POST", async () => {
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
		return json({ error: error.message, link_token: null }, { status: 500 })
	}
})

export const Route = createFileRoute("/__app/")({
	component: Home,
	loader: async () => {
		const res = await createLinkToken()

		if (res.link_token === null) {
			throw new Error(res.error)
		}

		return {
			linkToken: res.link_token,
		}
	},
})

function Home() {
	const { data: sessionData } = useSession()

	const { linkToken } = Route.useLoaderData()
	const config = {
		token: linkToken,
		onSuccess: async (publicToken, metadata) => {
			console.log(publicToken, metadata)

			const res = await fetch("http://localhost:8787/exchange-token", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionData.session.id}`,
				},

				body: JSON.stringify({ publicToken: publicToken }),
			})

			console.log(await res.text())

			// const { accessToken } = await response.json()

			// const res2 = await fetch("/api/plaid/transactions", {
			// 	method: "POST",
			// 	headers: {
			// 		"Content-Type": "application/json",
			// 	},
			// 	body: JSON.stringify({ accessToken: accessToken }),
			// })

			// console.log(await res2.json())
		},
	} as PlaidLinkOptions

	const { open, ready } = usePlaidLink(config)

	console.log(ready)
	return (
		<div className="p-2">
			<h3>Welcome Home!!!</h3>
			<Button onPress={() => open()}>Open</Button>
		</div>
	)
}
