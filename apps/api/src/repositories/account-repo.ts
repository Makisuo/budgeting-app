import { Effect, Option } from "effect"

import { Database } from "@maple/api-utils"
import type { Account } from "@maple/api-utils/models"
import { schema } from "db"
import { eq } from "drizzle-orm"
import { SqlLive } from "~/services/sql"

export class AccountRepo extends Effect.Service<AccountRepo>()("AccountRepo", {
	effect: Effect.gen(function* () {
		const db = yield* Database.Database

		// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
		const getAccountsReadyForSync = db.makeQuery((execute, input: void) =>
			execute((client) =>
				client.query.accounts.findMany({
					where: (table, { isNull, or, sql }) =>
						or(isNull(table.lastSync), sql`${table.lastSync} < NOW() - INTERVAL '6 hours'`),
				}),
			),
		)

		const findById = db.makeQuery((execute, input: typeof Account.Id.Type) =>
			execute((client) =>
				client.query.accounts.findFirst({ where: (table, { eq }) => eq(table.id, input) }),
			).pipe(Effect.map(Option.fromNullable)),
		)

		const update = db.makeQuery(
			(execute, input: { id: typeof Account.Id.Type; data: typeof Account.Update.Type }) =>
				execute((client) =>
					client.update(schema.accounts).set(input.data).where(eq(schema.accounts.id, input.id)).returning(),
				).pipe(Effect.map((value) => value[0]!)),
		)

		const updateVoid = db.makeQuery(
			(execute, input: { id: typeof Account.Id.Type; data: typeof Account.Update.Type }) =>
				execute((client) =>
					client.update(schema.accounts).set(input.data).where(eq(schema.accounts.id, input.id)),
				),
		)

		const insert = db.makeQuery((execute, input: typeof Account.Insert.Type) =>
			execute((client) => client.insert(schema.accounts).values([input]).returning()),
		)

		const insertVoid = db.makeQuery((execute, input: typeof Account.Model.insert.Type) =>
			execute((client) => client.insert(schema.accounts).values(input)),
		)

		return { getAccountsReadyForSync, findById, update, updateVoid, insert, insertVoid } as const
	}),
	dependencies: [SqlLive],
}) {}
