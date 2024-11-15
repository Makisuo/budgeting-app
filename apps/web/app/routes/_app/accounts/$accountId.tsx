import { createFileRoute, notFound } from "@tanstack/react-router"
import { getBankAccount } from "~/actions"

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
