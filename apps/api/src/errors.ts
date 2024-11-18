import { HttpApiSchema } from "@effect/platform"
import { Data, Schema } from "effect"

export class MapleError extends Data.TaggedError("HazelError")<{
	code: string
	message?: string | undefined
	cause?: unknown
}> {}

export class InternalError extends Schema.TaggedError<InternalError>()(
	"InternalError",
	{
		message: Schema.String,
	},
	HttpApiSchema.annotations({ status: 500 }),
) {}

export class Unauthorized extends Schema.TaggedError<Unauthorized>()(
	"Unauthorized",
	{
		message: Schema.String,
	},
	HttpApiSchema.annotations({ status: 401 }),
) {}

export class NotFound extends Schema.TaggedError<NotFound>()(
	"NotFound",
	{
		message: Schema.String,
	},
	HttpApiSchema.annotations({ status: 404 }),
) {}
