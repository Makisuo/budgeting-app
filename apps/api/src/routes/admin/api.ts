import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"
import { Authorization } from "~/authorization"
import { InternalError } from "~/errors"
import { Transaction } from "~/models/transaction"
import { Institution } from "~/services/gocardless/models/models"

export class AdminApi extends HttpApiGroup.make("admin")
	.add(
		HttpApiEndpoint.post("syncInstitutions", "/admin/sync/institutions")
			.addSuccess(Schema.Array(Institution))
			.addError(InternalError),
	)
	.add(
		HttpApiEndpoint.post("processTransactions", "/admin/process/transactions")
			.addError(InternalError)
			.addSuccess(Schema.Array(Transaction.json)),
	) {
	// .middlewareEndpoints(Authorization) {}
}
