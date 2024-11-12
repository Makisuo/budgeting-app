import { HttpApiSchema } from "@effect/platform"
import { Data, Schema } from "effect"

export class MapleError extends Data.TaggedError("HazelError")<{
	code: string
	message?: string | undefined
	cause?: unknown
}> {}

export class InternalError extends Schema.TaggedError<InternalError>()(
	"InternalError",
	{},
	HttpApiSchema.annotations({ status: 500 }),
) {}

export class Unauthorized extends Schema.TaggedError<Unauthorized>()(
	"Unauthorized",
	{},
	HttpApiSchema.annotations({ status: 401 }),
) {}
