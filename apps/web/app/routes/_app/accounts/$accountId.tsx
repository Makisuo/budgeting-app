import { Outlet, createFileRoute, notFound } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/start"
import { db } from "~/utils/db"
import { fetchUserSession } from "../../__root"

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

export const Route = createFileRoute("/_app/accounts/$accountId")({
	component: RouteComponent,
	loader: async ({ params }) => {
		const bankAccount = await getBankAccount(params.accountId)

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

	console.log(bankAccount, "XD")

	return (
		<div>
			{bankAccount.name}
			<Outlet />
		</div>
	)
}
