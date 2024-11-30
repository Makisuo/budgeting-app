import { HttpApiBuilder, HttpMiddleware } from "@effect/platform"
import { Layer, pipe } from "effect"
import { HttpAppLive } from "./http"
import { TracingLive } from "./services/tracing"

declare global {
	var env: Env
}

// const MainLayer = Layer.mergeAll([])

const HttpLive = Layer.mergeAll(HttpAppLive)

const Live = HttpLive.pipe(Layer.provide(TracingLive))

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
