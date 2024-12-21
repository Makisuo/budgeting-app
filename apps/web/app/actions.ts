import { createServerFn } from "@tanstack/start"
import { getWebRequest } from "vinxi/http"

import { getAuth } from "@clerk/tanstack-start/server"

export const fetchUserSession = createServerFn({ method: "GET" }).handler(async () => {
	const user = await getAuth(getWebRequest())

	return {
		userId: user.userId,
		orgId: user.orgId,
		orgRole: user.orgRole,
	}
})
