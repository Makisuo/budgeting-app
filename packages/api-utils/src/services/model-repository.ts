import type { InferSelectModel, Table } from "drizzle-orm"
import { eq } from "drizzle-orm"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import type { ParseError } from "effect/ParseResult"
import * as Schema from "effect/Schema"

import { Database, type DatabaseError } from "./database"

export interface EntitySchema extends Schema.Schema.AnyNoContext {
	readonly fields: Schema.Struct.Fields
	readonly insert: Schema.Schema.AnyNoContext
	readonly update: Schema.Schema.AnyNoContext
	readonly json: Schema.Schema.AnyNoContext
	readonly jsonCreate: Schema.Schema.AnyNoContext
	readonly jsonUpdate: Schema.Schema.AnyNoContext
}

export interface RepositoryOptions<Col extends string> {
	idColumn: Col
}

export type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>

export interface Repository<RecordType, S extends EntitySchema, Col extends string, Id> {
	readonly insert: (insert: S["insert"]["Type"]) => Effect.Effect<RecordType[], DatabaseError | ParseError>

	readonly insertVoid: (insert: S["insert"]["Type"]) => Effect.Effect<void, DatabaseError | ParseError>

	readonly update: (
		update: PartialExcept<S["update"]["Type"], Col>,
	) => Effect.Effect<RecordType, DatabaseError | ParseError>

	readonly updateVoid: (
		update: PartialExcept<S["update"]["Type"], Col>,
	) => Effect.Effect<void, DatabaseError | ParseError>

	readonly findById: (id: Id) => Effect.Effect<Option.Option<RecordType>, DatabaseError>

	readonly deleteById: (id: Id) => Effect.Effect<void, DatabaseError>
}

export function makeRepository<
	T extends Table<any>,
	Col extends keyof InferSelectModel<T>,
	RecordType extends InferSelectModel<T>,
	S extends EntitySchema,
	Id extends InferSelectModel<T>[Col],
>(
	table: T,
	schema: S,
	options: RepositoryOptions<Col>,
): Effect.Effect<Repository<RecordType, S, Col, Id>, never, Database> {
	return Effect.gen(function* () {
		const db = yield* Database
		const { idColumn } = options

		const insert = (data: S["insert"]["Type"]) =>
			db.makeQueryWithSchema(schema.insert as Schema.Schema<S["insert"]>, (execute, input) =>
				execute((client) => client.insert(table).values([input]).returning()),
			)(data) as Effect.Effect<RecordType[], DatabaseError | ParseError>

		const insertVoid = (data: S["insert"]["Type"]) =>
			db.makeQueryWithSchema(schema.insert as Schema.Schema<S["insert"]>, (execute, input) =>
				execute((client) => client.insert(table).values(input)),
			)(data) as Effect.Effect<void, DatabaseError | ParseError>

		const update = (data: S["update"]["Type"]) =>
			db.makeQueryWithSchema(Schema.partial(schema.update as Schema.Schema<S["update"]>), (execute, input) =>
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
			db.makeQueryWithSchema(Schema.partial(schema.update as Schema.Schema<S["update"]>), (execute, input) =>
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
						.from(table as Table<any>)
						// @ts-expect-error
						.where(eq(table[idColumn], id))
						.limit(1),
				).pipe(Effect.map((results) => Option.fromNullable(results[0] as RecordType))),
			)(id) as Effect.Effect<Option.Option<RecordType>, DatabaseError>

		const deleteById = (id: Id) =>
			db.makeQuery((execute, id: Id) =>
				// @ts-expect-error
				execute((client) => client.delete(table).where(eq(table[idColumn], id))),
			)(id) as Effect.Effect<void, DatabaseError>

		return {
			insert,
			insertVoid,
			update,
			updateVoid,
			findById,
			deleteById,
		}
	})
}
