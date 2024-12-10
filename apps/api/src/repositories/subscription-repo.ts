import { Effect } from "effect"

import { Model, SqlClient } from "@effect/sql"
import { Account } from "~/models/account"
import { SqlLive } from "~/services/sql"

const TABLE_NAME = "subscriptions"
const SPAN_PREFIX = "SubscriptionRepo"

export class SubscriptionRepo extends Effect.Service<SubscriptionRepo>()("SubscriptionRepo", {
	effect: Effect.gen(function* () {
		const sql = yield* SqlClient.SqlClient

		const baseRepository = yield* Model.makeRepository(Account, {
			tableName: TABLE_NAME,
			spanPrefix: SPAN_PREFIX,
			idColumn: "id",
		})

		return { ...baseRepository } as const
	}),
	dependencies: [SqlLive],
}) {}
