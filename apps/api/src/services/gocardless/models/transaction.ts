import { Schema as S } from "effect"

export const Currency = S.String
export type Currency = S.Schema.Type<typeof Currency>

export class TorAccount extends S.Class<TorAccount>("TorAccount")({
	iban: S.String,
}) {}

export class Amount extends S.Class<Amount>("Amount")({
	amount: S.String,
	currency: Currency,
}) {}

export class AdditionalDataStructured extends S.Class<AdditionalDataStructured>("AdditionalDataStructured")({
	chargeAmount: Amount,
}) {}

export class Transaction extends S.Class<Transaction>("Transaction")({
	transactionId: S.String,
	bookingDate: S.DateFromString,
	valueDate: S.optional(S.Union(S.Null, S.DateFromString)),
	bookingDateTime: S.NullishOr(S.DateFromString),
	valueDateTime: S.optional(S.Union(S.Null, S.DateFromString)),
	transactionAmount: Amount,
	creditorName: S.optional(S.Union(S.Null, S.String)),
	remittanceInformationUnstructuredArray: S.NullishOr(S.Array(S.String)),
	proprietaryBankTransactionCode: S.String,
	internalTransactionId: S.NullishOr(S.String),
	debtorName: S.optional(S.Union(S.Null, S.String)),
	currencyExchange: S.optional(
		S.Union(
			S.suspend(() => CurrencyExchange),
			S.Null,
		),
	),
	additionalDataStructured: S.optional(S.Union(AdditionalDataStructured, S.Null)),
	debtorAccount: S.NullishOr(S.Union(TorAccount, S.Struct({}))),
	creditorAccount: S.NullishOr(S.Union(TorAccount, S.Struct({}))),
}) {}

export class CurrencyExchange extends S.Class<CurrencyExchange>("CurrencyExchange")({
	instructedAmount: Amount,
	sourceCurrency: Currency,
	exchangeRate: S.String,
	unitCurrency: Currency,
	targetCurrency: S.String,
}) {}
