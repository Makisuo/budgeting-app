import { createFileRoute } from "@tanstack/react-router"
import { createServerFn, json } from "@tanstack/start"
import { plaidClient } from "./api/plaid/create-link-token"

import { type PlaidLinkOptions, usePlaidLink } from "react-plaid-link"

import { CountryCode, Products } from "plaid"
import { useEffect } from "react"
import { Card } from "~/components/ui"
import { Button } from "~/components/ui/button"
import { db } from "~/utils/db"

const getPlaidItems = createServerFn("GET", async (userId: string) => {
	const plaidItems = await db.query.plaidItem.findMany()

	return plaidItems
})

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
	loader: async ({ context }) => {
		const res = await createLinkToken()

		const plaidItems = await getPlaidItems(context.auth.user.id)

		if (res.link_token === null) {
			throw new Error(res.error)
		}

		return {
			linkToken: res.link_token,
			plaidItems,
		}
	},
})

function Home() {
	const { auth } = Route.useRouteContext()

	useEffect(() => {
		fetch("http://localhost:8787/sync-bank-accounts", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${auth.session.id}`,
			},
		})
	}, [auth])

	const { linkToken, plaidItems } = Route.useLoaderData()
	const config = {
		token: linkToken,
		onEvent: (event) => {
			console.log(event)
		},
		onSuccess: async (publicToken, metadata) => {
			const res = await fetch("http://localhost:8787/exchange-token", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${auth.session.id}`,
				},

				body: JSON.stringify({ publicToken: publicToken }),
			})

			console.log(await res.text())
		},
	} as PlaidLinkOptions

	const { open, ready } = usePlaidLink(config)

	return (
		<div className="p-2">
			<h3>Welcome Home!!!</h3>
			<Button isPending={!ready} onPress={() => open()}>
				Open
			</Button>

			{plaidItems.map((item) => (
				<Card key={item.id}>
					<Card.Header>Plaid Items</Card.Header>
					<Card.Content>{item.accessToken}</Card.Content>
				</Card>
			))}
		</div>
	)
}
