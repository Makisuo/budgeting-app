import { HttpApiBuilder, HttpMiddleware } from "@effect/platform"
import { Database } from "@maple/api-utils"
import { Effect, Layer, Runtime, pipe } from "effect"
import { HttpAppLive } from "./http"
import { EnvVars } from "./lib/env-vars"
import { AccountRepo } from "./repositories/account-repo"
import { InstitutionRepo } from "./repositories/institution-repo"
import { RequisitionRepo } from "./repositories/requisition-repo"
import { SubscriptionRepo } from "./repositories/subscription-repo"
import { TransactionRepo } from "./repositories/transaction-repo"
import { TransactionHelper } from "./routes/transactions/transaction"
import { Workflows } from "./services/cloudflare/workflows"
import { CronService } from "./services/cron"
import { GoCardlessService } from "./services/gocardless/gocardless-service"
import { TracingLive } from "./services/tracing"
import { TransactionHelpers } from "./services/transaction"
import { workflows } from "./workflows"

export * from "./workflows"

declare global {
	var env: Env

	type WorkflowsBinding = typeof workflows
}

const DatabaseLive = Layer.unwrapEffect(
	EnvVars.pipe(
		Effect.map((envVars) =>
			Database.layer({
				url: envVars.DATABASE_URL,
				ssl: !envVars.IS_DEV,
			}),
		),
	),
).pipe(Layer.provide(EnvVars.Default))

const MainLayer = Layer.mergeAll(
	GoCardlessService.Default,
	InstitutionRepo.Default,
	RequisitionRepo.Default,
	AccountRepo.Default,
	TransactionRepo.Default,
	TransactionHelper.Default,
	SubscriptionRepo.Default,
	TransactionHelpers.Default,
	Workflows.fromRecord(() => workflows),
).pipe(Layer.provide(DatabaseLive), Layer.provide(EnvVars.Default))

const HttpLive = Layer.mergeAll(HttpAppLive)

const Live = HttpLive.pipe(Layer.provide(TracingLive), Layer.provide(MainLayer))

export default {
	async fetch(request, env, ctx): Promise<Response> {
		Object.assign(globalThis, {
			env,
		})

		Object.assign(process, {
			env: { ...env, DATABASE_URL: env.HYPERDRIVE.connectionString },
		})

		const handler = HttpApiBuilder.toWebHandler(Live, {
			middleware: pipe(HttpMiddleware.logger),
		})

		const res = await handler.handler(request)

		ctx.waitUntil(handler.dispose())

		const origin = request.headers.get("Origin")
		res.headers.set("Access-Control-Allow-Origin", origin || "*")

		return res
	},
	async scheduled(controller, env) {
		Object.assign(globalThis, {
			env,
		})

		Object.assign(process, {
			env: { ...env, DATABASE_URL: env.HYPERDRIVE.connectionString },
		})

		const program = Effect.gen(function* () {
			const cron = yield* CronService

			yield* cron.run()
		}).pipe(Effect.provide(CronService.Default), Effect.provide(MainLayer))

		await Runtime.runPromise(Runtime.defaultRuntime)(program)
	},
} satisfies ExportedHandler<Env>
