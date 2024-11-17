import { HttpApiBuilder, HttpMiddleware } from "@effect/platform"
import { ConfigProvider, Layer } from "effect"
import { AuthorizationLive } from "./api"
import { HttpLive } from "./http"
import { AccountRepo } from "./routes/plaid/account-repo"
import { TransactionRepo } from "./routes/plaid/transaction-repo"
import { TransactionService } from "./routes/plaid/transactions"
import { BetterAuthService } from "./services/auth-service"
import { DrizzleLive } from "./services/db-service"
import { PlaidService } from "./services/plaid-service"

// TODO: Clean up this file and move things to a main layer and move logger config into its own layer

declare global {
	// eslint-disable-next-line no-var
	var env: Env
}

const Live = HttpLive.pipe(
	Layer.provide(AuthorizationLive),
	Layer.provide(DrizzleLive),
	Layer.provide(PlaidService.Default),
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

		const ConfigLayerLive = Layer.setConfigProvider(ConfigProvider.fromJson(env))

		const handler = HttpApiBuilder.toWebHandler(Live.pipe(Layer.provide(ConfigLayerLive)), {
			middleware: HttpMiddleware.logger,
		})

		return handler.handler(request)
	},
} satisfies ExportedHandler<Env>
