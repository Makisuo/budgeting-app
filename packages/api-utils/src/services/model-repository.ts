import type { InferSelectModel, Table } from "drizzle-orm"
import { eq } from "drizzle-orm"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import type { ParseError } from "effect/ParseResult"
import type * as Schema from "effect/Schema"

import { Database, type DatabaseError } from "./database"

export type Any = Schema.Schema.AnyNoContext & {
	readonly fields: Schema.Struct.Fields
	readonly insert: Schema.Schema.AnyNoContext
	readonly update: Schema.Schema.AnyNoContext
	readonly json: Schema.Schema.AnyNoContext
	readonly jsonCreate: Schema.Schema.AnyNoContext
	readonly jsonUpdate: Schema.Schema.AnyNoContext
}

export type Repository<RecordType, S extends Any, Id> = {
	readonly insert: (insert: S["insert"]["Type"]) => Effect.Effect<RecordType[], DatabaseError | ParseError>

	readonly insertVoid: (insert: S["insert"]["Type"]) => Effect.Effect<void, DatabaseError | ParseError>

	readonly update: (update: S["update"]["Type"]) => Effect.Effect<RecordType, DatabaseError | ParseError>

	readonly updateVoid: (update: S["update"]["Type"]) => Effect.Effect<void, DatabaseError | ParseError>

	readonly findById: (id: Id) => Effect.Effect<Option.Option<RecordType>, DatabaseError>

	readonly delete: (id: Id) => Effect.Effect<void, DatabaseError>
}

export const makeRepository = <
	T extends Table<any>,
	Col extends keyof InferSelectModel<T> & string,
	RecordType extends InferSelectModel<T>,
	S extends Any,
	Id extends InferSelectModel<T>[Col],
>(
	table: T,
	schema: S,
	{
		idColumn,
	}: {
		idColumn: Col
	},
): Effect.Effect<Repository<RecordType, S, Id>, never, Database> =>
	Effect.gen(function* () {
		const db = yield* Database

		const insert = (data: S["insert"]["Type"]) =>
			db.makeQueryWithSchema(schema.insert as Schema.Schema<S["insert"]>, (execute, input) =>
				execute((client) => client.insert(table).values([input]).returning()),
			)(data) as Effect.Effect<RecordType[], DatabaseError | ParseError>

		const insertVoid = (data: S["insert"]["Type"]) =>
			db.makeQueryWithSchema(schema.insert as Schema.Schema<S["insert"]>, (execute, input) =>
				execute((client) => client.insert(table).values(input)),
			)(data) as Effect.Effect<void, DatabaseError | ParseError>

		const update = (data: S["update"]["Type"]) =>
			db.makeQueryWithSchema(schema.update as Schema.Schema<S["update"]>, (execute, input) =>
				execute((client) =>
					client
						.update(table)
						.set(input)
						// @ts-expect-error
						.where(eq(table[idColumn], input[idColumn]))
						.returning(),
				).pipe(Effect.map((result) => result[0] as RecordType)),
			)(data) as Effect.Effect<RecordType, DatabaseError | ParseError>

		const updateVoid = (data: S["update"]["Type"]) =>
			db.makeQueryWithSchema(schema.update as Schema.Schema<S["update"]>, (execute, input) =>
				execute((client) =>
					client
						.update(table)
						.set(input)
						// @ts-expect-error
						.where(eq(table[idColumn], input[idColumn])),
				),
			)(data) as Effect.Effect<void, DatabaseError | ParseError>

		const findById = (id: Id) =>
			db.makeQuery((execute, id: Id) =>
				execute((client) =>
					client
						.select()
						// @ts-expect-error
						.from(table)
						// @ts-expect-error
						.where(eq(table[idColumn], id))
						.limit(1),
				).pipe(Effect.map((results) => Option.fromNullable(results[0] as RecordType))),
			)(id) as Effect.Effect<Option.Option<RecordType>, DatabaseError>

		const deleteItem = (id: Id) =>
			db.makeQuery((execute, id: Id) =>
				execute((client) =>
					client
						.delete(table)
						// @ts-expect-error
						.where(eq(table[idColumn], id)),
				),
			)(id) as Effect.Effect<void, DatabaseError>

		return {
			insert,
			insertVoid,
			update,
			updateVoid,
			findById,
			delete: deleteItem,
		} as Repository<RecordType, S, Id>
	})
