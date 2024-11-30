import { HttpApiBuilder, HttpMiddleware } from "@effect/platform"
import { Layer, pipe } from "effect"
import { HttpAppLive } from "./http"
import { AccountRepo } from "./repositories/account-repo"
import { InstitutionRepo } from "./repositories/institution-repo"
import { RequisitionRepo } from "./repositories/requisition-repo"
import { GoCardlessService } from "./services/gocardless/gocardless-service"
import { TracingLive } from "./services/tracing"

declare global {
	var env: Env
}

const MainLayer = Layer.mergeAll(
	GoCardlessService.Default,
	InstitutionRepo.Default,
	RequisitionRepo.Default,
	AccountRepo.Default,
)

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
} satisfies ExportedHandler<Env>
