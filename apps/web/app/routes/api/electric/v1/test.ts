import { json } from "@tanstack/start"
import { createAPIFileRoute } from "@tanstack/start/api"

const publicTable = ["institutions"]

export const APIRoute = createAPIFileRoute("/api/electric/v1/test")({
	GET: async ({ request, params }) => {
		const url = new URL(request.url)
		const table = url.searchParams.get("table") as string

		const originUrl = new URL("/v1/shape", process.env.ELECTRIC_URL)

		if (!publicTable.includes(table)) {
			originUrl.searchParams.set("where", `tenant_id = '${"userId"}'`)
		}

		url.searchParams.forEach((value, key) => {
			if (["live", "table", "handle", "offset", "cursor"].includes(key)) {
				originUrl.searchParams.set(key, value)
			}
		})

		let resp = await fetch(originUrl.toString())
		if (resp.headers.get("content-encoding")) {
			const headers = new Headers(resp.headers)
			headers.delete("content-encoding")
			headers.delete("content-length")
			resp = new Response(resp.body, {
				status: resp.status,
				statusText: resp.statusText,
				headers,
			})
		}

		return new Response(originUrl.href, { status: 200 })
	},
})
