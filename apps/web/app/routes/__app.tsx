import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { createServerFn, json } from "@tanstack/start"
import { CountryCode, Products } from "plaid"
import { AppSidebar } from "~/components/app-sidebar"
import { ProfileMenu } from "~/components/profile-menu"
import { Sidebar } from "~/components/ui"
import { db } from "~/utils/db"
import { fetchUserSession } from "./__root"
import { plaidClient } from "./api/plaid/create-link-token"

export const getBankAccounts = createServerFn("GET", async () => {
	const session = await fetchUserSession()

	if (!session) {
		throw new Error("Unauthorized")
	}

	const bankAccounts = await db.query.bankAccount.findMany({
		where: (table, { eq }) => eq(table.userId, session.user.id),
	})

	return bankAccounts
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

export const Route = createFileRoute("/__app")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		if (!context.auth) {
			throw redirect({ to: "/auth/signin" })
		}

		return {
			auth: context.auth,
		}
	},
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

function RouteComponent() {
	return (
		<Sidebar.Provider>
			<AppSidebar />
			<Sidebar.Inset>
				<Sidebar.Nav isSticky>
					<span className="flex items-center gap-x-3">
						<Sidebar.Trigger className="-mx-2" />
					</span>
					<div className="flex items-center gap-x-2 sm:hidden">
						<ProfileMenu />
					</div>
				</Sidebar.Nav>
				<div className="overflow-hidden p-4 lg:p-6">
					<Outlet />
				</div>
			</Sidebar.Inset>
		</Sidebar.Provider>
	)
}
