import type { Request } from "@cloudflare/workers-types"

export type CloudflareEnv = {
	ASSETS: { fetch: (request: Request) => Promise<Response> }
	CF_PAGES: "1"
	CF_PAGES_BRANCH: string
	CF_PAGES_COMMIT_SHA: string
	CF_PAGES_URL: string
}

export function isInCloudflareCI() {
	return process.env.CF_PAGES_COMMIT_SHA !== undefined
}

export async function getCloudflareProxyEnv() {
	const { getPlatformProxy } = await import("wrangler")

	const proxy = await getPlatformProxy<CloudflareEnv>({
		environment: process.env.npm_lifecycle_event === "build" ? "production" : "development",
	})

	const cloudflareEnv = proxy.env

	await proxy.dispose()

	return cloudflareEnv
}
