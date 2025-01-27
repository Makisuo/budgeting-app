import { Effect } from "effect"
import { AccountRepo } from "~/repositories/account-repo"
import { Workflows } from "./cloudflare/workflows"

export class CronService extends Effect.Service<CronService>()("@hazel/Cron", {
	effect: Effect.gen(function* () {
		const accountRepo = yield* AccountRepo

		const workflow = yield* Workflows
		const syncTransactionWorkflow = workflow.getWorkflow<WorkflowsBinding>("SyncTransactionsWorkflow")
		const detectDirectTransferTransactionsWorkflow = workflow.getWorkflow<WorkflowsBinding>(
			"DetectDirectTransferTransactionsWorkflow",
		)

		const run = () =>
			Effect.gen(function* () {
				yield* detectDirectTransferTransactionsWorkflow.create()
				const accounts = yield* accountRepo.getAccountsReadyForSync()

				yield* Effect.logInfo("Found accounts ready for sync", "Count", accounts.length)

				for (const account of accounts) {
					yield* syncTransactionWorkflow.create({ params: { accountId: account.id } })
					yield* Effect.logInfo("Syncing Account", account.id)
				}
			})

		return { run } as const
	}),
	dependencies: [AccountRepo.Default],
}) {}
