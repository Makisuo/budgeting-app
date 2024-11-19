import { HttpApiBuilder, HttpMiddleware } from "@effect/platform"
import { ConfigProvider, DateTime, Effect, Layer, LogLevel, Logger, ManagedRuntime, Schema, pipe } from "effect"
import { AuthorizationLive } from "./api"
import { HttpAppLive } from "./http"
import { AccountRepo } from "./routes/plaid/account-repo"
import { TransactionRepo } from "./routes/plaid/transaction-repo"
import { TransactionService } from "./routes/plaid/transactions"
import { BetterAuthService } from "./services/auth-service"
import { DrizzleLive } from "./services/db-service"
import { GoCardlessService } from "./services/gocardless/gocardless-service"
import { PlaidService } from "./services/plaid-service"

import { Workflow, Workflows, makeWorkflow } from "./services/cloudflare/workflows"

declare global {
	var env: Env

	type WorkflowsBinding = typeof workflows
}

export const SyncAccountWorkflow = makeWorkflow(
	{
		name: "SyncAccountWorkflow",
		binding: "SYNC_ACCOUNT_WORKFLOW",
		schema: Schema.Struct({
			requisitionId: Schema.String,
		}),
	},
	(args) =>
		Effect.gen(function* () {
			const workflow = yield* Workflow

			const goCardless = yield* GoCardlessService

			const requisition = yield* goCardless.getRequistion(args.requisitionId)

			yield* Effect.forEach(requisition.accounts, (accountId) =>
				workflow.do(
					"syncAccount",
					Effect.gen(function* () {
						const account = yield* goCardless.getAccount(accountId)

						yield* Effect.log("account", account)
					}).pipe(Effect.catchAll(Effect.die)),
				),
			)

			yield* workflow.do("step2", Effect.log("step2"))

			yield* Effect.log("args", args)
		}).pipe(
			Effect.provide(GoCardlessService.Default),

			Effect.catchAll(Effect.die),
			Effect.provide(Logger.minimumLogLevel(LogLevel.All)),
			Effect.provide(Logger.structured),
		),
)

const HttpLive = Layer.mergeAll(HttpAppLive).pipe(Layer.provide(Workflows.fromRecord(() => workflows)))

const workflows = {
	SyncAccountWorkflow,
}

const Live = HttpLive.pipe(
	Layer.provide(AuthorizationLive),
	Layer.provide(DrizzleLive),
	Layer.provide(PlaidService.Default),
	Layer.provide(GoCardlessService.Default),
	Layer.provide(TransactionService.Default),
	Layer.provide(BetterAuthService.Default),
	Layer.provide(AccountRepo.Default),
	Layer.provide(TransactionRepo.Default),
)

export default {
	async fetch(request, env, ctx): Promise<Response> {
		Object.assign(globalThis, {
			env,
		})

		Object.assign(process, {
			env,
		})

		// const ConfigLayerLive = Layer.setConfigProvider(ConfigProvider.fromJson(env))

		const handler = HttpApiBuilder.toWebHandler(Live, {
			middleware: HttpMiddleware.logger,
		})

		return handler.handler(request)
	},
} satisfies ExportedHandler<Env>
