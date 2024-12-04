import { HttpApiBuilder, HttpMiddleware } from "@effect/platform"
import { Effect, Layer, Runtime, pipe } from "effect"
import { HttpAppLive } from "./http"
import { AccountRepo } from "./repositories/account-repo"
import { InstitutionRepo } from "./repositories/institution-repo"
import { RequisitionRepo } from "./repositories/requisition-repo"
import { TranscationRepo } from "./repositories/transaction-repo"
import { Workflows } from "./services/cloudflare/workflows"
import { CronService } from "./services/cron"
import { GoCardlessService } from "./services/gocardless/gocardless-service"
import { TracingLive } from "./services/tracing"
import { workflows } from "./workflows"

export * from "./workflows"

declare global {
	var env: Env

	type WorkflowsBinding = typeof workflows
}

const MainLayer = Layer.mergeAll(
	GoCardlessService.Default,
	InstitutionRepo.Default,
	RequisitionRepo.Default,
	AccountRepo.Default,
	TranscationRepo.Default,
	Workflows.fromRecord(() => workflows),
).pipe()

const HttpLive = Layer.mergeAll(HttpAppLive)

const Live = HttpLive.pipe(Layer.provide(TracingLive), Layer.provide(MainLayer))

export default {
	async fetch(request, env): Promise<Response> {
		Object.assign(globalThis, {
			env,
		})
		Object.assign(process, {
			env,
		})

		const handler = HttpApiBuilder.toWebHandler(Live, {
			middleware: pipe(HttpMiddleware.logger),
		})

		return handler.handler(request)
	},
	async scheduled(controller, env) {
		Object.assign(globalThis, {
			env,
		})
		Object.assign(process, {
			env: { ...env },
		})

		const program = Effect.gen(function* () {
			const cron = yield* CronService

			yield* cron.run()
		}).pipe(Effect.provide(CronService.Default), Effect.provide(MainLayer))

		await Runtime.runPromise(Runtime.defaultRuntime)(program)
	},
} satisfies ExportedHandler<Env>
