import { Effect } from "effect"
import { AccountRepo } from "~/repositories/account-repo"

export class CronService extends Effect.Service<CronService>()("@hazel/Cron", {
	effect: Effect.gen(function* () {
		const accountRepo = yield* AccountRepo

		const run = () =>
			Effect.gen(function* () {
				const accounts = yield* accountRepo.getAccountsReadyForSync()

				yield* Effect.logInfo("Found accounts ready for sync", "Count", accounts.length)

				for (const account of accounts) {
					yield* Effect.logInfo("Syncing Account", account.id)
				}
			})

		return { run } as const
	}),
	dependencies: [AccountRepo.Default],
}) {}
