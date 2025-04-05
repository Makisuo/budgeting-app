import { HttpApiBuilder, HttpApiScalar, HttpServer } from "@effect/platform"
import { Layer, pipe } from "effect"
import { Api, AuthorizationLive } from "./api"
import { HttpAdminLive } from "./routes/admin/http"
import { HttpBetterAuthLive } from "./routes/better-auth/http"
import { HttpGoCardlessLive } from "./routes/go-cardless/http"
import { HttpRootLive } from "./routes/root/http"
import { HttpSubscriptionLive } from "./routes/subscriptions/http"
import { HttpTransactionLive } from "./routes/transactions/http"
import { HttpBudgetLive } from "./routes/budgets/http"
import { withLogFormat, withMinimalLogLevel } from "./services/logger"

export const ApiLive = Layer.provide(HttpApiBuilder.api(Api), [
	HttpRootLive,
	HttpGoCardlessLive,
	HttpAdminLive,
	HttpBetterAuthLive,

	// App Endpoints
	HttpSubscriptionLive,
	HttpTransactionLive,
	HttpBudgetLive,
])

export const HttpAppLive = pipe(
	HttpApiBuilder.Router.Live,
	Layer.provide(HttpApiScalar.layer()),
	Layer.provideMerge(HttpApiBuilder.middlewareOpenApi()),
	Layer.provideMerge(
		HttpApiBuilder.middlewareCors({
			credentials: true,
		}),
	),
	Layer.provideMerge(HttpServer.layerContext),
	Layer.provideMerge(ApiLive),

	Layer.provide(withLogFormat),
	Layer.provide(withMinimalLogLevel),

	Layer.provide(AuthorizationLive),

	// Layer.provide(Logger.minimumLogLevel(LogLevel.All)),
	// Layer.provide(Logger.structured),
)
