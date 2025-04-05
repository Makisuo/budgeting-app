import { HttpApiBuilder } from "@effect/platform"
import { Context, Layer } from "effect"
import { AdminApi } from "./routes/admin/api"
import { BetterAuthApi } from "./routes/better-auth/api"
import { GoCardlessApi } from "./routes/go-cardless/api"
import { RootApi } from "./routes/root/api"
import { SubscriptionApi } from "./routes/subscriptions/api"
import { TransactionApi } from "./routes/transactions/api"
import { BudgetApi } from "./routes/budgets/api"
import { Authorization } from "./authorization"

export const Api = HttpApiBuilder.api({
	"/api/v1": {
		"/admin": AdminApi,
		"/auth": BetterAuthApi,
		"/go-cardless": GoCardlessApi,
		"/subscriptions": SubscriptionApi,
		"/transactions": TransactionApi,
		"/budgets": BudgetApi,
		...RootApi,
	},
})

export const AuthorizationLive = Layer.succeed(Authorization, {
	withAuth: () => (handler) => (c) => {
		const authorization = c.req.header("authorization")
		if (!authorization) {
			return c.json({ error: "Unauthorized" }, 401)
		}

		const token = authorization.replace("Bearer ", "")
		if (!token) {
			return c.json({ error: "Unauthorized" }, 401)
		}

		// TODO: Verify token
		const tenantId = token

		c.set("tenantId", tenantId)

		return handler(c)
	},
})
