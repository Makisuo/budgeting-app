import { type } from "arktype"
import { format } from "date-fns"
import { atom } from "jotai"
import { generalSettingsAtom } from "~/routes/_app/settings"

const rate = type({
	"[string]": "number",
})

const body = type({
	amount: "number",
	base: "string",
	date: "string",
	rates: rate,
})

export const exchangeRateAtom = atom(async (get) => getExchangeRates(get(generalSettingsAtom).currency))

export const getExchangeRates = async (from: string, date?: Date) => {
	const response = await fetch(
		`https://api.frankfurter.dev/v1/${date ? format(date, "YYYY-MM-DD") : "latest"}?base=${from}`,
		{
			cache: "force-cache",
		},
	)

	const json = await response.json()

	const parsed = body.assert(json)

	return parsed
}
