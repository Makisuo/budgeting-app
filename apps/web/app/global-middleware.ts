import { defineMiddleware } from "vinxi/http"
import type { CloudflareEnv } from "./lib/cloudflare"

export default defineMiddleware({
	onRequest: async (event) => {
		if (import.meta.env.DEV) {
			const { getPlatformProxy } = await import("wrangler")

			const proxy = await getPlatformProxy<CloudflareEnv>()

			event.context.cloudflare = proxy

			await proxy.dispose()
		}
	},
})
