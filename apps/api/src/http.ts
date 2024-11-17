import { HttpApiBuilder, HttpApiScalar, HttpServer } from "@effect/platform"
import { Layer, LogLevel, Logger, pipe } from "effect"
import { Api } from "./api"
import { HttpAdminLive } from "./routes/admin/http"
import { HttpGoCardlessLive } from "./routes/go-cardless/http"
import { HttpBaseLive } from "./routes/main/http"
import { HttpPlaidLive } from "./routes/plaid/http"

export const ApiLive = Layer.provide(HttpApiBuilder.api(Api), [
	HttpPlaidLive,
	HttpGoCardlessLive,
	HttpBaseLive,
	HttpAdminLive,
])

export const HttpLive = pipe(
	HttpApiBuilder.Router.Live,
	Layer.provide(HttpApiScalar.layer()),
	Layer.provideMerge(HttpApiBuilder.middlewareOpenApi()),
	Layer.provideMerge(HttpApiBuilder.middlewareCors()),
	Layer.provideMerge(HttpServer.layerContext),
	Layer.provideMerge(ApiLive),
	Layer.provide(Logger.minimumLogLevel(LogLevel.All)),
	Layer.provide(Logger.structured),
)
