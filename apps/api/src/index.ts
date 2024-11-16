import { HttpApiBuilder, HttpApiScalar, HttpMiddleware, HttpServer } from "@effect/platform"
import { ConfigProvider, Layer, ManagedRuntime } from "effect"
import { Api, AuthorizationLive } from "./api"
import { HttpBaseLive } from "./routes/main/http"
import { HttpPlaidLive } from "./routes/plaid/http"
import { BetterAuthService } from "./services/auth-service"
import { DrizzleLive } from "./services/db-service"
import { PlaidService } from "./services/plaid-service"

const ApiLive = Layer.provide(HttpApiBuilder.api(Api), [HttpPlaidLive, HttpBaseLive])

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const ApiDocsLive = HttpApiScalar.layer().pipe(Layer.provide(ApiLive))
		const OpenApiLive = HttpApiBuilder.middlewareOpenApi().pipe(Layer.provide(ApiLive))

		const MainLayer = Layer.mergeAll(
			HttpApiBuilder.middlewareCors(),
			ApiLive,
			OpenApiLive,
			ApiDocsLive,
			HttpServer.layerContext,
		)

		const ConfigLayerLive = Layer.setConfigProvider(ConfigProvider.fromJson(env))

		const { handler } = HttpApiBuilder.toWebHandler(
			MainLayer.pipe(
				Layer.provide(AuthorizationLive),
				Layer.provide(DrizzleLive),
				Layer.provide(PlaidService.Default),
				Layer.provide(BetterAuthService.Default),
				Layer.provide(ConfigLayerLive),
			),
			{
				// middleware: (httpApp) => httpApp.pipe(HttpMiddleware.logger),
			},
		)

		return handler(request)
	},
} satisfies ExportedHandler<Env>
