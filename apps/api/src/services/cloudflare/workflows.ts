import type * as CloudflareWorkers from "cloudflare:workers"
import { WorkerEntrypoint } from "cloudflare:workers"
import type * as Cloudflare from "@cloudflare/workers-types/experimental"
import * as Context from "effect/Context"
import * as DateTime from "effect/DateTime"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import type { LazyArg } from "effect/Function"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Runtime from "effect/Runtime"
import * as Schema from "effect/Schema"

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

export class WorkflowEvent extends Context.Tag("WorkflowEvent")<
	WorkflowEvent,
	CloudflareWorkers.WorkflowEvent<unknown>
>() {
	static params = <T>(_: T) => this as Context.Tag<WorkflowEvent, CloudflareWorkers.WorkflowEvent<T>>
}

export interface Workflow {
	readonly do: <T>(
		name: string,
		effect: Effect.Effect<T>,
		options?: CloudflareWorkers.WorkflowStepConfig,
	) => Effect.Effect<T>
	readonly sleep: (name: string, duration: Duration.DurationInput) => Effect.Effect<void>
	readonly sleepUntil: (name: string, timestamp: DateTime.DateTime) => Effect.Effect<void>
}
export const Workflow = Context.GenericTag<Workflow>("Workflow")

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
	const ret = class extends WorkerEntrypoint<never> {
		static _tag = name as Tag

		static _binding = binding

		static _schema = schema

		run(...args: any) {
			return EffectWorkflowRun(schema, run).apply(null, args)
		}
	}

	return ret as unknown as WorkflowClass<Tag, A, I>
}

export const EffectWorkflowRun = <A, I>(
	schema: Schema.Schema<A, I>,
	effect: (event: A) => Effect.Effect<void, never, Workflow | WorkflowEvent>,
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
							// TODO: improve callback execution
							const fn = Effect.runtime<never>().pipe(
								Effect.bindTo("runtime"),
								Effect.andThen(({ runtime }) =>
									Effect.promise((signal) =>
										step.do(
											name,
											options ?? {},
											() => Runtime.runPromise(runtime)(callback, { signal }) as any,
										),
									),
								),
							)

							return fn as any
						},

						sleep: (name, duration) => Effect.promise(() => step.sleep(name, Duration.toSeconds(duration))),

						sleepUntil: (name, timestamp) =>
							Effect.promise(() => step.sleepUntil(name, DateTime.toEpochMillis(timestamp))),
					})),
				),
				DateTime.withCurrentZone(zone),
			),
		)
}
