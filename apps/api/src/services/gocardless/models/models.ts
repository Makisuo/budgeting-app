import { Brand, Schema } from "effect"
import { AccountId } from "~/models/account"
import { InstitutionId } from "~/models/institution"
import { RequisitionId } from "~/models/requistion"
import { Transaction } from "./transaction"

export class Account extends Schema.Class<Account>("Account")({
	id: AccountId,
	created: Schema.DateFromString,
	last_accessed: Schema.DateFromString,
	iban: Schema.String,
	bban: Schema.String,
	status: Schema.String,
	institution_id: InstitutionId,
	owner_name: Schema.String,
}) {}

export class AccountDetails extends Schema.Class<AccountDetails>("AccountDetails")({
	resourceId: Schema.NullishOr(Schema.String),
	iban: Schema.NullishOr(Schema.String),
	currency: Schema.NullishOr(Schema.String),
	ownerName: Schema.NullishOr(Schema.String),
	name: Schema.NullishOr(Schema.String),
	product: Schema.NullishOr(Schema.String),
	bic: Schema.NullishOr(Schema.String),
	usage: Schema.NullishOr(Schema.String),
}) {}

export class Institution extends Schema.Class<Institution>("Institution")({
	id: InstitutionId,
	name: Schema.String,
	bic: Schema.String,
	transaction_total_days: Schema.NumberFromString,
	countries: Schema.Array(Schema.String),
	logo: Schema.String,
	max_access_valid_for_days: Schema.NumberFromString,
}) {}

export class Balance extends Schema.Class<Balance>("Balance")({
	balanceAmount: Schema.Struct({
		currency: Schema.String,
		amount: Schema.String,
	}),
	balanceType: Schema.String,
	referenceDate: Schema.DateFromString,
}) {}

export class GetAccountDetailsResponse extends Schema.Class<GetAccountDetailsResponse>("GetAccountDetailsResponse")({
	account: AccountDetails,
}) {}

export class NewTokenResponse extends Schema.Class<NewTokenResponse>("NewTokenResponse")({
	access: Schema.String,
	access_expires: Schema.Number,
	refresh: Schema.String,
	refresh_expires: Schema.Number,
}) {}

export { Transaction }

export class GetBalancesResponse extends Schema.Class<GetBalancesResponse>("GetBalancesResponse")({
	balances: Schema.Array(Balance),
}) {}

export class GetTransactionsResponse extends Schema.Class<GetTransactionsResponse>("GetTransactionsResponse")({
	transactions: Schema.Struct({
		booked: Schema.Array(Transaction),
		pending: Schema.Array(Transaction),
	}),
}) {}

export type AgreementId = Brand.Branded<string, "@GoCardless/AgreementId">
export const AgreementId = Brand.nominal<AgreementId>()

const AgreementIdFromString = Schema.String.pipe(Schema.fromBrand(AgreementId))

export class CreateAgreementResponse extends Schema.Class<CreateAgreementResponse>("CreateAgreementResponse")({
	id: AgreementIdFromString,
	created: Schema.String,
	max_historical_days: Schema.Number,
	access_valid_for_days: Schema.Number,
	access_scope: Schema.Array(Schema.String),
	accepted: Schema.NullOr(Schema.String),
	institution_id: Schema.String,
}) {}

export class CreateLinkResponse extends Schema.Class<CreateLinkResponse>("CreateLinkResponse")({
	id: RequisitionId,
	redirect: Schema.String,
	status: Schema.String,
	agreement: Schema.String,
	accounts: Schema.Array(Schema.String),
	reference: Schema.String,
	user_language: Schema.String,
	link: Schema.String,
}) {}

export class GetRequisitionResponse extends Schema.Class<GetRequisitionResponse>("GetRequisitionResponse")({
	id: Schema.String,
	status: Schema.String,
	accounts: Schema.Array(AccountId),
	reference: Schema.String,
}) {}
