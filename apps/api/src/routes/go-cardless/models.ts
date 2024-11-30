import { Schema } from "effect"

export class CreateLinkResponse extends Schema.Class<CreateLinkResponse>("CreateLinkResponse")({
	link: Schema.String,
}) {}
