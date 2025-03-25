import type * as CloudflareWorkers from "cloudflare:workers"
import { WorkerEntrypoint } from "cloudflare:workers"
import type * as Cloudflare from "@cloudflare/workers-types/experimental"
import * as Cause from "effect/Cause"
import * as ConfigProvider from "effect/ConfigProvider"
import * as Context from "effect/Context"
import * as Data from "effect/Data"
import * as DateTime from "effect/DateTime"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import type { LazyArg } from "effect/Function"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Predicate from "effect/Predicate"
import * as Runtime from "effect/Runtime"
import * as Schema from "effect/Schema"
import * as Struct from "effect/Struct"

type WorkflowInstance = {
	readonly id: Effect.Effect<string>
	readonly pause: Effect.Effect<void>
	readonly resume: Effect.Effect<void>
	readonly terminate: Effect.Effect<void>
	readonly restart: Effect.Effect<void>
	readonly status: Effect.Effect<Cloudflare.InstanceStatus>
}

const makeInstance = (instance: Cloudflare.WorkflowInstance): WorkflowInstance => {
	return {
		id: Effect.sync(() => instance.id),
		pause: Effect.promise(() => instance.pause()),
		resume: Effect.promise(() => instance.resume()),
		terminate: Effect.promise(() => instance.terminate()),
		restart: Effect.promise(() => instance.restart()),
		status: Effect.promise(() => instance.status()),
	}
}

interface WorkflowInstanceCreateOptions<T = unknown> {
	readonly id?: string | undefined
	readonly params?: T | undefined
}

export interface WorkflowStepConfig {
	readonly retries?: {
		limit: number
		delay: Duration.DurationInput
		backoff?: "constant" | "linear" | "exponential"
	}
	readonly timeout?: Duration.DurationInput
}

const optionsToRetries = (options?: WorkflowStepConfig): CloudflareWorkers.WorkflowStepConfig => {
	const ret: CloudflareWorkers.WorkflowStepConfig = {}

	if (options?.retries) {
		ret.retries = {
			delay: Duration.toMillis(options.retries.delay),
			limit: options.retries.limit,
		}
		if (options.retries.backoff) {
			ret.retries.backoff = options.retries.backoff
		}
	}

	if (options?.timeout) {
		ret.timeout = Duration.toMillis(options.timeout)
	}

	return ret
}

interface CloudflareWorkflow {
	readonly get: (id: string) => Promise<any>
	readonly create: (options?: WorkflowInstanceCreateOptions) => Promise<any>
}

const make = <T extends Record<string, CloudflareWorkflow>, R extends Record<keyof T, WorkflowClass<any, any, any>>>(
	getEnv: LazyArg<T>,
	record: R,
) => {
	const getClass = (workflowTag: keyof T) => record[workflowTag]

	const getBinding = (ins: ReturnType<typeof getClass>) => getEnv()[ins._binding]

	const get = (workflowTag: keyof T, id: string) => {
		const workflow = getClass(workflowTag)
		return Effect.promise(() => getBinding(workflow)!.get(id)).pipe(Effect.map(makeInstance))
	}

	const create = <A = unknown>(workflowTag: keyof T, options?: WorkflowInstanceCreateOptions<A>) => {
		const workflow = getClass(workflowTag)
		const encode = Schema.encodeUnknown(workflow._schema)

		return pipe(
			options?.params ? encode(options.params) : Effect.succeed(undefined),
			Effect.flatMap((params) =>
				Effect.promise(() =>
					getBinding(workflow)!.create({
						id: options?.id,
						params,
					}),
				),
			),
			Effect.map(makeInstance),
		)
	}

	return {
		get,
		create,
		getWorkflow: <R extends Record<string, WorkflowClass<any, any, any>>>(workflowTag: keyof R) => ({
			get: (id: string) => get(workflowTag as any, id),
			create: (options?: WorkflowInstanceCreateOptions<R[typeof workflowTag]["_a"]>) =>
				create(workflowTag as any, options),
		}),
	}
}

export class Workflows extends Effect.Tag("Workflows")<Workflows, ReturnType<typeof make>>() {
	static fromRecord = <T extends Record<string, WorkflowClass<any, any, any>>>(record: LazyArg<T>) =>
		Layer.sync(this, () => make(() => (globalThis as any).env, record()))

	static getWorkflow = <R extends Record<string, WorkflowClass<any, any, any>>>(workflowTag: keyof R) =>
		Effect.map(this, (_) => _.getWorkflow<R>(workflowTag))
}

const workerdZone = DateTime.zoneUnsafeMakeNamed("UTC")

export class WorkflowEvent extends Context.Tag("@server:workflow-event")<
	WorkflowEvent,
	CloudflareWorkers.WorkflowEvent<unknown>
>() {
	static params = <T>(_: T) => this as Context.Tag<WorkflowEvent, CloudflareWorkers.WorkflowEvent<T>>
}

type DoPaylad<Payload extends Schema.Struct.Fields> = {
	[k in Exclude<keyof Payload, "_tag">]: Payload[k] extends Schema.Schema.All ? Payload[k]["Type"] : never
}

export class Workflow extends Context.Tag("@server:workflow")<
	Workflow,
	{
		readonly do: <A, E = never, R = never>(
			name: string,
			effect: Effect.Effect<A, E, R>,
			options?: WorkflowStepConfig,
		) => Effect.Effect<A, E, never>

		readonly schema: <
			Tag extends string,
			Payload extends Schema.Struct.Fields,
			Success extends Schema.Schema.All,
			Failure extends Schema.Schema.All,
			R,
		>(
			SchemaClass: Schema.TaggedRequestClass<
				any,
				Tag,
				{
					readonly _tag: Schema.tag<Tag>
				} & Payload,
				Success,
				Failure
			>,
			effect: (payload: Payload) => Effect.Effect<Success["Type"], Failure["Type"], R>,
			options?: WorkflowStepConfig,
		) => (_: Payload) => Effect.Effect<Success["Type"], Failure["Type"], never>

		readonly sleep: (name: string, duration: Duration.DurationInput) => Effect.Effect<void, never>

		readonly sleepUntil: (name: string, timestamp: DateTime.DateTime) => Effect.Effect<void, never>
	}
>() {
	static do = <A, E = never, R = never>(name: string, effect: Effect.Effect<A, E, R>, options?: WorkflowStepConfig) =>
		Effect.flatMap(Workflow, (workflow) => workflow.do(name, effect, options))

	static sleep = (name: string, duration: Duration.DurationInput) =>
		Effect.flatMap(Workflow, (workflow) => workflow.sleep(name, duration))

	static sleepUntil = (name: string, timestamp: DateTime.DateTime) =>
		Effect.flatMap(Workflow, (workflow) => workflow.sleepUntil(name, timestamp))

	static schema =
		<
			Tag extends string,
			Payload extends Schema.Struct.Fields,
			Success extends Schema.Schema.All,
			Failure extends Schema.Schema.All,
			R,
		>(
			SchemaClass: Schema.TaggedRequestClass<any, Tag, Payload, Success, Failure>,
			effect: (payload: DoPaylad<Payload>) => Effect.Effect<Success["Type"], Failure["Type"], R>,
			options?: WorkflowStepConfig,
		) =>
		(payload: DoPaylad<Payload>) =>
			Effect.flatMap(Workflow, (workflow) => workflow.schema(SchemaClass as any, effect, options)(payload))
}

export interface WorkflowClass<T, A, I> extends WorkerEntrypoint<never> {
	readonly _tag: T
	readonly _a: A
	readonly _i: I
	readonly _schema: Schema.Schema<A, I>
	readonly _binding: string
	readonly run: (...args: any) => Promise<void>
}

export const makeWorkflowEntrypoint = <const Tag, A, I, E = never>(
	{ binding, name, schema }: { name: Tag; binding: string; schema: Schema.Schema<A, I> },
	run: (event: A) => Effect.Effect<void, E, Workflow | WorkflowEvent>,
) => {
	const entrypoint = class extends WorkerEntrypoint<never> {
		static _tag = name as Tag
		static _binding = binding
		static _schema = schema
		run(...args: any) {
			return runEffectWorkflow<A, I, E>(schema, run, this.env).apply(null, args)
		}
	}

	return entrypoint as unknown as WorkflowClass<Tag, A, I>
}

// fork from Schema.Defect, but keep the stack
const Defect = Schema.transform(Schema.Unknown, Schema.Unknown, {
	strict: true,
	decode: (u) => {
		if (Predicate.isObject(u) && "message" in u && typeof u.message === "string") {
			const err = new Error(u.message, { cause: u })
			if ("name" in u && typeof u.name === "string") {
				err.name = u.name
			}
			err.stack = "stack" in u && typeof u.stack === "string" ? u.stack : ""
			return err
		}
		return String(u)
	},
	encode: (defect) => {
		if (defect instanceof Error) {
			return {
				name: defect.name,
				message: defect.message,
				stack: defect.stack,
			}
		}
		return String(defect)
	},
}).annotations({ identifier: "Defect" })

class WorkflowDoError extends Data.TaggedError("WorkflowDoError")<{
	readonly error: Error
}> {}

export const runEffectWorkflow = <A, I, E = never>(
	schema: Schema.Schema<A, I>,
	effect: (event: A) => Effect.Effect<void, E, Workflow | WorkflowEvent>,
	env: Env,
) => {
	const decode = Schema.decodeUnknown(schema)
	const DoExitSchema = Schema.Exit({
		defect: Defect,
		failure: Schema.Union(Defect, Schema.Any),
		success: Schema.Any,
	})
	const encodeDoExit = Schema.encodeUnknownSync(DoExitSchema)
	const decodeDoExit = Schema.decodeUnknownSync(DoExitSchema)

	return (event: CloudflareWorkers.WorkflowEvent<I>, step: CloudflareWorkers.WorkflowStep): Promise<unknown> =>
		pipe(
			decode(event.payload),
			Effect.flatMap((payload) => effect(payload)),
			Effect.provide(
				Layer.sync(Workflow, () => ({
					sleep: (name, duration) => Effect.promise(() => step.sleep(name, Duration.toMillis(duration))),
					sleepUntil: (name, timestamp) =>
						Effect.promise(() => step.sleepUntil(name, DateTime.toEpochMillis(timestamp))),
					do: (name, callback, options) => {
						const run = pipe(
							Effect.runtime<never>(),
							Effect.andThen((runtime) =>
								Effect.tryPromise({
									try: (signal) => {
										const run = Runtime.runPromiseExit(runtime)

										return step.do(name, optionsToRetries(options), async () => {
											const exit = (await run(callback as Effect.Effect<any, any>, {
												signal,
											})) as Exit.Exit<any>

											if (Exit.isSuccess(exit)) {
												return encodeDoExit(exit)
											}

											if (Exit.isFailure(exit)) {
												/**
												 * If it is "die", then no exception is thrown; pass this step up to the outer layer to handle the termination.
												 */
												if (Cause.isDieType(exit.cause)) {
													// Workerd unsupoorts Serialization Effect Cause
													// Covert to plain error message, not Effect Cause
													return encodeDoExit(exit)
												}

												/**
												 * Throw an error to make step do retry
												 * Cloudflare Workflow will wrap error string to Error instance
												 */
												throw JSON.stringify(encodeDoExit(exit))
											}
										})
									},
									catch: (error) =>
										new WorkflowDoError({
											error: error as Error,
										}),
								}),
							),
							Effect.flatMap((result) => {
								// Step do success, but not return anything
								if (!result || typeof result === "undefined") {
									return Effect.void
								}

								const exit = decodeDoExit(result)

								if (Exit.isSuccess(exit)) {
									return Effect.succeed(exit.value)
								}

								if (Exit.isFailure(exit)) {
									const cause = exit.cause

									if (Cause.isDieType(cause)) {
										// biome-ignore lint/performance/noDelete: <explanation>
										delete (cause.defect as any).cause

										return Effect.failCause(cause)
									}

									return Effect.failCause(cause)
								}

								return Effect.void
							}),
							Effect.catchTag("WorkflowDoError", ({ error }) => {
								// TOOD: Unexpected error, just ignore it
								if (!error) return Effect.void

								try {
									// Try to parse error message to Exit
									const exit = decodeDoExit(JSON.parse(error.message))

									if (Exit.isFailure(exit)) {
										const cause = exit.cause

										if (Cause.isFailType(cause)) {
											// To make it more compatible with the structure of Cause, for more attractive logs
											const err = new Error(cause.error.message)
											err.name = cause.error._tag || cause.error.name || "Error"
											err.stack = cause.error.stack || ""

											return Effect.failCause(Cause.fail(err as any))
										}

										return Effect.failCause(cause)
									}
								} catch (error) {
									console.error("parse exit error", error)
								}

								if (Cause.isCause(error)) {
									return Effect.failCause(error)
								}

								if (error instanceof Error) {
									return Effect.fail(error)
								}

								return Effect.fail(new Error(String(error)))
							}),
							Effect.catchAllCause((_) => Effect.die(Cause.isDieType(_) ? _.defect : _)),
							Effect.tapErrorCause(Effect.logError),
						)

						return run as any
					},
					schema: (SchemaClass, callback, options) => (payload) => {
						const sc = new SchemaClass(
							Struct.omit(payload, "_tag") as any,
						) as unknown as Schema.TaggedRequest<string, any, any, any, any, any, any, any, never>
						const successSchema = Schema.successSchema(sc)
						const failureSchema = Schema.failureSchema(sc)
						const isAllowEmpty = successSchema.ast._tag === "VoidKeyword"

						const ExitSchema = Schema.Exit({
							defect: Defect,
							failure: Schema.Union(Defect, failureSchema),
							success: Schema.transform(successSchema, Schema.Any, {
								decode: (fa) => {
									return fa
								},
								encode: (ti) => {
									return isAllowEmpty ? undefined : ti
								},
								strict: false,
							}),
						})
						const encodeExit = Schema.encodeUnknownSync(ExitSchema)
						const decodeExit = Schema.decodeUnknownSync(ExitSchema)

						const run = pipe(
							Effect.runtime<never>(),
							Effect.andThen((runtime) =>
								Effect.tryPromise({
									try: (signal) => {
										const run = Runtime.runPromiseExit(runtime)

										return step.do(SchemaClass.identifier, optionsToRetries(options), async () => {
											const exit = (await run(
												callback(payload as any) as Effect.Effect<any, any>,
												{
													signal,
												},
											)) as Exit.Exit<any>

											if (Exit.isSuccess(exit)) {
												try {
													return encodeExit(exit)
												} catch (error) {
													return encodeExit(Exit.die(error))
												}
											}

											if (Exit.isFailure(exit)) {
												/**
												 * If it is "die", then no exception is thrown; pass this step up to the outer layer to handle the termination.
												 */
												if (Cause.isDieType(exit.cause)) {
													// Workerd unsupoorts Serialization Effect Cause
													// Covert to plain error message, not Effect Cause
													try {
														return encodeExit(exit)
													} catch (error) {
														return encodeExit(Exit.die(error))
													}
												}

												/**
												 * Throw an error to make step do retry
												 * Cloudflare Workflow will wrap error string to Error instance
												 */
												throw JSON.stringify(encodeExit(exit))
											}
										})
									},
									catch: (error) =>
										new WorkflowDoError({
											error: error as Error,
										}),
								}),
							),
							Effect.flatMap((result) => {
								// Step do success, but not return anything
								if (!result || typeof result === "undefined") {
									return Effect.void
								}

								const exit = decodeExit(result)

								if (Exit.isSuccess(exit)) {
									return Effect.succeed(exit.value)
								}

								if (Exit.isFailure(exit)) {
									const cause = exit.cause

									if (Cause.isDieType(cause)) {
										// biome-ignore lint/performance/noDelete: <explanation>
										delete (cause.defect as any).cause

										return Effect.failCause(cause)
									}

									return Effect.failCause(cause)
								}

								return Effect.void
							}),
							Effect.catchTag("WorkflowDoError", ({ error }) => {
								// TOOD: Unexpected error, just ignore it
								if (!error) return Effect.void

								try {
									// Try to parse error message to Exit
									const exit = decodeExit(JSON.parse(error.message))

									if (Exit.isFailure(exit)) {
										const cause = exit.cause

										if (Cause.isFailType(cause)) {
											// To make it more compatible with the structure of Cause, for more attractive logs
											const err = new Error(cause.error.message)
											err.name = cause.error._tag || cause.error.name || "Error"
											err.stack = cause.error.stack || ""

											return Effect.failCause(Cause.fail(err as any))
										}

										return Effect.failCause(cause)
									}
								} catch (error) {
									console.error("parse exit error", error)
								}

								if (Cause.isCause(error)) {
									return Effect.failCause(error)
								}

								if (error instanceof Error) {
									return Effect.fail(error)
								}

								return Effect.fail(new Error(String(error)))
							}),
							Effect.catchAllCause((_) => Effect.die(Cause.isDieType(_) ? _.defect : _)),
							Effect.tapErrorCause(Effect.logError),
						)

						return run as any
					},
				})),
			),
			Effect.provide(Layer.succeed(WorkflowEvent, event)),
			Effect.provide(
				Layer.setConfigProvider(
					ConfigProvider.fromJson({ ...env, DATABASE_URL: env.HYPERDRIVE.connectionString }),
				),
			),
			DateTime.withCurrentZone(workerdZone),
			Effect.runPromise,
		)
}
