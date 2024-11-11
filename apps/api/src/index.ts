import { HttpApiBuilder } from "@effect/platform"
import { ConfigProvider, Layer } from "effect"
import { Api } from "./api"
import { HttpBaseLive } from "./routes/main/http"
import { HttpPlaidLive } from "./routes/plaid/http"

const ApiLive = Layer.provide(HttpApiBuilder.api(Api), [HttpPlaidLive, HttpBaseLive])

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const configLayer = ConfigProvider.fromJson(env)

		const ConfigLayerLive = Layer.setConfigProvider(configLayer)

		const MainLayer = Layer.mergeAll(ConfigLayerLive, ApiLive)

		const { handler } = HttpApiBuilder.toWebHandler(
			// @ts-expect-error
			MainLayer.pipe(
				// Layer.provide(HttpApiSwagger.layer()),
				// Layer.provide(HttpApiBuilder.middlewareOpenApi()),
				// Layer.provide(HttpApiBuilder.middlewareCors()),
			),
		)

		return handler(request)
	},
} satisfies ExportedHandler<Env>
