import { createFileRoute } from "@tanstack/react-router"
import { BudgetStats } from "./-components/budget-stats"

export const Route = createFileRoute("/_app/budgets/")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className="space-y-6">
			<BudgetStats />
		</div>
	)
}
