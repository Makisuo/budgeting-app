import { Outlet, createFileRoute, notFound } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/start"
import { db } from "~/utils/db"
import { fetchUserSession } from "../../__root"

const getBankAccount = createServerFn({ method: "GET" })
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

export const Route = createFileRoute("/_app/accounts/$accountId")({
	component: RouteComponent,
	loader: async ({ params }) => {
		const bankAccount = await getBankAccount({ data: params.accountId })

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
