import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Effect, Layer, Schema } from "effect"
import { PlaidApi } from "./plaid/api"
import { PlaidLive } from "./plaid/http"

export const MapleApi = HttpApi.empty.add(PlaidApi)

const ApiLive = HttpApiBuilder.api(MapleApi).pipe(
	Layer.provide(HttpApiBuilder.middlewareCors()),

	Layer.provide([PlaidLive]),
)

// @ts-expect-error
const { handler } = HttpApiBuilder.toWebHandler(ApiLive)

export default {
	async fetch(request, env, ctx): Promise<Response> {
		return handler(request)
	},
} satisfies ExportedHandler<Env>
