import { getAuth } from "@clerk/tanstack-start/server"
import { createAPIFileRoute } from "@tanstack/start/api"
import { getWebRequest } from "vinxi/http"

const ELECTRIC_URL = import.meta.env.ELECTRIC_URL

const publicTable = ["institutions"]

export const Route = createAPIFileRoute("/api/electric/v1/shape")({
	GET: async ({ request }) => {
		const { userId } = await getAuth(getWebRequest())

		if (!userId) {
			return new Response(null, { status: 401 })
		}

		const url = new URL(request.url)
		const table = url.searchParams.get("table") as string

		const originUrl = new URL("/v1/shape", ELECTRIC_URL)

		if (!publicTable.includes(table)) {
			originUrl.searchParams.set("where", `tenant_id = '${userId}'`)
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
		return resp
	},
})