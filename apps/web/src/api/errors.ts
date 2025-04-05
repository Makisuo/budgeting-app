import { HttpApiSchema } from "@effect/platform"
import { Schema } from "effect"

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
