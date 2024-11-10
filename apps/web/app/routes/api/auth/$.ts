import { createAPIFileRoute } from "@tanstack/start/api"
import { auth } from "db"

export const Route = createAPIFileRoute("/api/auth/$")({
	GET: ({ request }) => {
		return auth.handler(request)
	},
	POST: ({ request }) => {
		return auth.handler(request)
	},
})
