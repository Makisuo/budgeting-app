import { Data } from "effect"

export class MapleError extends Data.TaggedError("HazelError")<{
	code: string
	message?: string | undefined
	cause?: unknown
}> {}
