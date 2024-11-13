import { Link, createFileRoute, notFound } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/start"
import { Card } from "~/components/ui"
import { db } from "~/utils/db"
import { getBankAccounts } from "./__app"
import { fetchUserSession } from "./__root"

const getBankAccount = createServerFn("GET", async (id: string) => {
	const session = await fetchUserSession()

	if (!session) {
		throw new Error("Unauthorized")
	}

	const bankAccount = await db.query.bankAccount.findFirst({
		where: (table, { eq, and }) => and(eq(table.id, id), eq(table.userId, session.user.id)),
	})

	return bankAccount
})

export const Route = createFileRoute("/__app/accounts/$id")({
	component: RouteComponent,
	loader: async ({ params }) => {
		const bankAccount = await getBankAccount(params.id)

		if (!bankAccount) {
			throw notFound()
		}

		return {
			bankAccount,
		}
	},
})

function RouteComponent() {
	const { bankAccount } = Route.useLoaderData()

	return <div>{bankAccount.name}</div>
}
