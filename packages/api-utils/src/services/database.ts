import { schema } from "db"
import type { ExtractTablesWithRelations } from "drizzle-orm"
import type { PgTransaction } from "drizzle-orm/pg-core"
import { type PostgresJsDatabase, type PostgresJsQueryResultHKT, drizzle } from "drizzle-orm/postgres-js"
import { Schema } from "effect"
import * as Cause from "effect/Cause"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as Layer from "effect/Layer"
import type { ParseError } from "effect/ParseResult"
import * as Redacted from "effect/Redacted"
import * as Runtime from "effect/Runtime"
import * as Schedule from "effect/Schedule"

import postgres from "postgres"

export type TransactionClient = PgTransaction<
	PostgresJsQueryResultHKT,
	typeof schema,
	ExtractTablesWithRelations<typeof schema>
>

export type Client = PostgresJsDatabase<typeof schema> & {
	$client: postgres.Sql
}

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
	readonly type: "unique_violation" | "foreign_key_violation" | "connection_error"
	readonly cause: postgres.PostgresError
}> {
	public override toString() {
		return `DatabaseError: ${this.cause.message}`
	}

	public get message() {
		return this.cause.message
	}
}

const matchPgError = (error: unknown) => {
	if (error instanceof postgres.PostgresError) {
		switch (error.code) {
			case "23505":
				return new DatabaseError({ type: "unique_violation", cause: error })
			case "23503":
				return new DatabaseError({ type: "foreign_key_violation", cause: error })
			case "08000":
				return new DatabaseError({ type: "connection_error", cause: error })
		}
	}
	return null
}

export class DatabaseConnectionLostError extends Data.TaggedError("DatabaseConnectionLostError")<{
	cause: unknown
	message: string
}> {}

export type Config = {
	url: Redacted.Redacted
	ssl: boolean
}

const makeService = (config: Config) =>
	Effect.gen(function* () {
		const sql = yield* Effect.acquireRelease(
			Effect.sync(() =>
				postgres(Redacted.value(config.url), {
					ssl: config.ssl,
					idle_timeout: 0,
					connect_timeout: 0,
				}),
			),
			(pool) => Effect.promise(() => pool.end()),
		)

		yield* Effect.tryPromise(() => sql`SELECT 1`).pipe(
			Effect.retry(
				Schedule.jitteredWith(Schedule.spaced("1.25 seconds"), { min: 0.5, max: 1.5 }).pipe(
					Schedule.tapOutput((output) =>
						Effect.logWarning(
							`[Database client]: Connection to the database failed. Retrying (attempt ${output}).`,
						),
					),
				),
			),
			Effect.tap(() => Effect.logInfo("[Database client]: Connection to the database established.")),
			Effect.orDie,
		)

		const db = drizzle(sql, { schema })

		const execute = Effect.fn(<T>(fn: (client: Client) => Promise<T>) =>
			Effect.tryPromise({
				try: () => fn(db),
				catch: (cause) => {
					const error = matchPgError(cause)
					if (error !== null) {
						return error
					}
					throw cause
				},
			}),
		)

		const transaction = Effect.fn("Database.transaction")(
			<T, E, R>(
				execute: (
					tx: <U>(fn: (client: TransactionClient) => Promise<U>) => Effect.Effect<U, DatabaseError>,
				) => Effect.Effect<T, E, R>,
			) =>
				Effect.runtime<R>().pipe(
					Effect.map((runtime) => Runtime.runPromiseExit(runtime)),
					Effect.flatMap((runPromiseExit) =>
						Effect.async<T, DatabaseError | E, R>((resume) => {
							db.transaction(async (tx: TransactionClient) => {
								const txWrapper = (fn: (client: TransactionClient) => Promise<any>) =>
									Effect.tryPromise({
										try: () => fn(tx),
										catch: (cause) => {
											const error = matchPgError(cause)
											if (error !== null) {
												return error
											}
											throw cause
										},
									})

								const result = await runPromiseExit(execute(txWrapper))
								Exit.match(result, {
									onSuccess: (value) => {
										resume(Effect.succeed(value))
									},
									onFailure: (cause) => {
										if (Cause.isFailure(cause)) {
											resume(Effect.fail(Cause.originalError(cause) as E))
										} else {
											resume(Effect.die(cause))
										}
									},
								})
							}).catch((cause) => {
								const error = matchPgError(cause)
								resume(error !== null ? Effect.fail(error) : Effect.die(cause))
							})
						}),
					),
				),
		)

		/**
		 * Creates a query function factory that validates input against a schema.
		 *
		 * @param inputSchema The Effect Schema for the input data.
		 * @param queryFn The function performing the database operation. It receives the validated input.
		 * @returns A function that takes raw input and an optional transaction executor,
		 *          returns an Effect that includes Schema.ParseError in its error channel.
		 */
		const makeQueryWithSchema = <InputSchema extends Schema.Schema.AnyNoContext, A, E, R>(
			inputSchema: InputSchema,
			queryFn: (
				execute: <T>(
					fn: (client: Client | TransactionClient) => Promise<T>,
				) => Effect.Effect<T, DatabaseError, never>,
				validatedInput: Schema.Schema.Type<InputSchema>,
				options?: { spanPrefix?: string },
			) => Effect.Effect<A, E, never>,
		) => {
			return (
				rawData: unknown,
				tx?: <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, DatabaseError, never>,
			): Effect.Effect<A, E | DatabaseError | ParseError, never> => {
				const executor = tx ?? execute

				return Effect.gen(function* () {
					const validatedInput = yield* Schema.encodeUnknown(inputSchema)(rawData)

					const result = yield* queryFn(executor, validatedInput)
					return result
				}).pipe(
					Effect.withSpan("queryWithSchema", {
						attributes: { "input.schema": inputSchema.ast.toString() },
					}),
				)
			}
		}

		const makeQuery = <Input, A, E, R>(
			queryFn: (
				execute: <T>(fn: (client: Client | TransactionClient) => Promise<T>) => Effect.Effect<T, DatabaseError>,
				input: Input,
			) => Effect.Effect<A, E, R>,
		) => {
			return (
				input: Input,
				tx?: <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, DatabaseError>,
			) => {
				return queryFn(tx ?? execute, input)
			}
		}

		return {
			execute,
			transaction,
			makeQuery,
			makeQueryWithSchema,
		} as const
	})

type Shape = Effect.Effect.Success<ReturnType<typeof makeService>>

export class Database extends Effect.Tag("Database")<Database, Shape>() {}

export const layer = (config: Config) => Layer.scoped(Database, makeService(config))
