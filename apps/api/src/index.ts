import { HttpApiBuilder, HttpApiScalar, HttpMiddleware, HttpServer } from "@effect/platform"
import { Config, ConfigProvider, Effect, Layer, Logger, ManagedRuntime } from "effect"
import { Api, AuthorizationLive } from "./api"
import { HttpBaseLive } from "./routes/main/http"
import { AccountRepo } from "./routes/plaid/account-repo"
import { HttpPlaidLive } from "./routes/plaid/http"
import { TransactionService } from "./routes/plaid/transactions"
import { BetterAuthService } from "./services/auth-service"
import { DrizzleLive } from "./services/db-service"
import { PlaidService } from "./services/plaid-service"

// TODO: Clean up this file and move things to a main layer and move logger config into its own layer

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

		const LogLevelLive = Config.logLevel("LOG_LEVEL")
			.pipe(
				Effect.andThen((level) => Logger.minimumLogLevel(level)),
				Layer.unwrapEffect,
			)
			.pipe(Layer.provide(Logger.pretty))

		const { handler } = HttpApiBuilder.toWebHandler(
			MainLayer.pipe(
				Layer.provide(LogLevelLive),
				Layer.provide(AuthorizationLive),
				Layer.provide(DrizzleLive),
				Layer.provide(PlaidService.Default),
				Layer.provide(TransactionService.Default),
				Layer.provide(BetterAuthService.Default),
				Layer.provide(AccountRepo.Default),
				Layer.provide(ConfigLayerLive),
			),
			{
				middleware: (httpApp) => httpApp.pipe(HttpMiddleware.logger),
			},
		)

		return handler(request)
	},
} satisfies ExportedHandler<Env>
