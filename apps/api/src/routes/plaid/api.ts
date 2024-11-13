import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"
import { Authorization } from "../../authorization"
import { InternalError, Unauthorized } from "../../errors"

export class PlaidApi extends HttpApiGroup.make("plaid")
	.add(
		HttpApiEndpoint.post("exchangeToken", "/exchange-token")
			.addSuccess(Schema.String)
			.addError(InternalError)
			.addError(Unauthorized)
			.setHeaders(Schema.Any)
			.setPayload(
				Schema.Struct({
					publicToken: Schema.String,
				}),
			)
			.middleware(Authorization),
	)
	.add(
		HttpApiEndpoint.post("syncBankAccounts", "/sync-bank-accounts")
			.addSuccess(Schema.String)
			.addError(InternalError)
			.addError(Unauthorized)
			.setHeaders(Schema.Any)
			.middleware(Authorization),
	) {}
