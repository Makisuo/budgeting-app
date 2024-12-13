import { HttpApiBuilder, HttpApiScalar, HttpServer } from "@effect/platform"
import { Layer, pipe } from "effect"
import { Api, AuthorizationLive } from "./api"
import { HttpAdminLive } from "./routes/admin/http"
import { HttpGoCardlessLive } from "./routes/go-cardless/http"
import { HttpRootLive } from "./routes/root/http"
import { HttpSubscriptionLive } from "./routes/subscriptions/http"
import { withLogFormat, withMinimalLogLevel } from "./services/logger"

export const ApiLive = Layer.provide(HttpApiBuilder.api(Api), [
	HttpRootLive,
	HttpGoCardlessLive,
	HttpAdminLive,
	HttpSubscriptionLive,
])

export const HttpAppLive = pipe(
	HttpApiBuilder.Router.Live,
	Layer.provide(HttpApiScalar.layer()),
	Layer.provideMerge(HttpApiBuilder.middlewareOpenApi()),
	Layer.provideMerge(HttpApiBuilder.middlewareCors()),
	Layer.provideMerge(HttpServer.layerContext),
	Layer.provideMerge(ApiLive),

	Layer.provide(withLogFormat),
	Layer.provide(withMinimalLogLevel),

	Layer.provide(AuthorizationLive),

	// Layer.provide(Logger.minimumLogLevel(LogLevel.All)),
	// Layer.provide(Logger.structured),
)
