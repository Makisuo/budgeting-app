import { json } from "@tanstack/start"
import { createAPIFileRoute } from "@tanstack/start/api"

export const APIRoute = createAPIFileRoute("/api/electric/v1/test")({
	GET: ({ request, params }) => {
		return json({ message: 'Hello "/api/electric/v1/test"!' })
	},
})
