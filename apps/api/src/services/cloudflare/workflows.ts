import type * as CloudflareWorkers from "cloudflare:workers"
import { WorkerEntrypoint } from "cloudflare:workers"
import type * as Cloudflare from "@cloudflare/workers-types/experimental"
import * as ConfigProvider from "effect/ConfigProvider"
import * as Context from "effect/Context"
import * as DateTime from "effect/DateTime"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import type { LazyArg } from "effect/Function"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as LogLevel from "effect/LogLevel"
import * as Logger from "effect/Logger"
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
	id?: string | undefined
	params?: T | undefined
}

export interface WorkflowStepConfig {
	retries?: {
		limit: number
		delay: Duration.DurationInput
		backoff?: "constant" | "linear" | "exponential"
	}
	timeout?: Duration.DurationInput
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
		const i = getClass(workflowTag)

		return Effect.promise(() => getBinding(i)!.get(id)).pipe(Effect.map(makeInstance))
	}

	const create = <A = unknown>(workflowTag: keyof T, options?: WorkflowInstanceCreateOptions<A>) => {
		const i = getClass(workflowTag)

		const encode = Schema.encodeUnknown(i._schema)

		return pipe(
			options?.params ? encode(options.params) : Effect.succeed(undefined),
			Effect.flatMap((params) =>
				Effect.promise(() =>
					getBinding(i)!.create({
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
			create: (options?: WorkflowInstanceCreateOptions<R[typeof workflowTag]["_i"]>) =>
				create(workflowTag as any, options),
		}),
	}
}

export class Workflows extends Effect.Tag("Workflows")<Workflows, ReturnType<typeof make>>() {
	static fromRecord = <T extends Record<string, WorkflowClass<any, any, any>>>(record: LazyArg<T>) =>
		Layer.sync(this, () => make(() => (globalThis as any).env, record()))
}

const zone = DateTime.zoneUnsafeMakeNamed("UTC")

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

		readonly fn: <
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
		Effect.flatMap(Workflow, (_) => _.do(name, effect, options))

	static sleep = (name: string, duration: Duration.DurationInput) =>
		Effect.flatMap(Workflow, (_) => _.sleep(name, duration))

	static sleepUntil = (name: string, timestamp: DateTime.DateTime) =>
		Effect.flatMap(Workflow, (_) => _.sleepUntil(name, timestamp))

	static fn =
		<
			Tag extends string,
			Payload extends Schema.Struct.Fields,
			Success extends Schema.Schema.All,
			Failure extends Schema.Schema.All,
			R,
		>(
			SchemaClass: Schema.TaggedRequestClass<any, Tag, Payload, Success, Failure>,
			effect: (_: DoPaylad<Payload>) => Effect.Effect<Success["Type"], Failure["Type"], R>,
			options?: WorkflowStepConfig,
		) =>
		(payload: DoPaylad<Payload>) =>
			Effect.flatMap(Workflow, (workflow) => workflow.fn(SchemaClass as any, effect, options)(payload))
}

export interface WorkflowClass<T, A, I> extends WorkerEntrypoint<never> {
	readonly _tag: T
	readonly _i: I
	readonly _a: A
	readonly _schema: Schema.Schema<A, I>
	readonly _binding: string
	readonly run: (...args: any) => Promise<void>
}

export const makeWorkflow = <const Tag, A, I>(
	{ binding, name, schema }: { name: Tag; binding: string; schema: Schema.Schema<A, I> },
	run: (event: A) => Effect.Effect<void, never, Workflow | WorkflowEvent>,
) => {
	const ret = class extends WorkerEntrypoint<Env> {
		static _tag = name as Tag
		static _binding = binding
		static _schema = schema
		run(...args: any) {
			return EffectWorkflowRun(schema, run, this.env).apply(null, args)
		}
	}

	return ret as unknown as WorkflowClass<Tag, A, I>
}

export const EffectWorkflowRun = <A, I, Env>(
	schema: Schema.Schema<A, I>,
	effect: (event: A) => Effect.Effect<void, never, Workflow | WorkflowEvent>,
	env: Env,
) => {
	const decode = Schema.decodeUnknown(schema)

	return (event: CloudflareWorkers.WorkflowEvent<I>, step: CloudflareWorkers.WorkflowStep): Promise<unknown> =>
		Effect.runPromise(
			pipe(
				decode(event.payload),
				Effect.flatMap((_) => effect(_)),
				Effect.provide(Layer.succeed(WorkflowEvent, event)),
				Effect.provide(
					Layer.sync(Workflow, () => ({
						do: (name, callback, options) => {
							const fn = Effect.runtime<never>().pipe(
								Effect.andThen((runtime) =>
									Effect.tryPromise({
										try: (signal) =>
											step.do(name, optionsToRetries(options), async () => {
												const run = Runtime.runPromise(runtime)

												return run(callback as Effect.Effect<any, any, never>, {
													signal,
												}) as Promise<any>
											}),
										catch: (error) => {
											return error
										},
									}),
								),
							)

							return fn as any
						},
						fn: (SchemaClass, callback, options) => {
							return (payload) => {
								const sc = new SchemaClass(
									Struct.omit(payload, "_tag") as any,
								) as unknown as Schema.TaggedRequest<string, any, any, any, any, any, any, any, never>

								const fn = Effect.runtime<never>().pipe(
									Effect.andThen((runtime) =>
										Effect.tryPromise({
											try: (signal) =>
												step.do(SchemaClass.identifier, optionsToRetries(options), async () => {
													const run = Runtime.runPromise(runtime)

													return run(
														pipe(
															callback(payload as any) as Effect.Effect<any, any, never>,
															Effect.flatMap((result) => {
																if (!sc[Schema.symbolWithResult]) {
																	return Effect.succeed(result)
																}

																const schema = Schema.successSchema(sc)

																if (
																	schema.ast._tag === "VoidKeyword" ||
																	schema.ast._tag === "NeverKeyword"
																) {
																	return Effect.void
																}

																return Schema.serializeSuccess(
																	sc,
																	result,
																) as Effect.Effect<any, any, never>
															}),
														),
														{ signal },
													) as Promise<any>
												}),
											catch: (error) => {
												if (!sc[Schema.symbolWithResult]) {
													return error
												}

												return Effect.runSync(Schema.serializeFailure(sc, error))
											},
										}),
									),
									Effect.map((result) => {
										if (!sc[Schema.symbolWithResult]) {
											return result
										}

										const schema = Schema.successSchema(sc)

										if (schema.ast._tag === "VoidKeyword" || schema.ast._tag === "NeverKeyword") {
											return
										}

										return Effect.runSync(Schema.deserializeSuccess(sc, result))
									}),
								)

								return fn as any
							}
						},
						sleep: (name, duration) => Effect.promise(() => step.sleep(name, Duration.toMillis(duration))),
						sleepUntil: (name, timestamp) =>
							Effect.promise(() => step.sleepUntil(name, DateTime.toEpochMillis(timestamp))),
					})),
				),
				Effect.provide(Layer.setConfigProvider(ConfigProvider.fromJson(env))),
				DateTime.withCurrentZone(zone),
				Logger.withMinimumLogLevel(LogLevel.All),
				Effect.catchAllCause(Effect.logError),
				Effect.ignore,
			),
		)
}
