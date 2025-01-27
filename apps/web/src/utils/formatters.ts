export const currencyFormatter = (currency: string) =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency,
	})

export const compactCurrencyFormatter = (currency: string, maximumFractionDigits = 2) =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency,
		maximumFractionDigits: maximumFractionDigits,
		notation: "compact",
	})

export const dashboardCompactNumberFormatter = (locale = "en", maximumFractionDigits = 4) => {
	return Intl.NumberFormat(locale, {
		maximumFractionDigits: maximumFractionDigits,
		notation: "compact",
	})
}

export const formatIBAN = (iban: string): string => {
	// Remove all spaces and convert to uppercase
	const cleanIban = iban.replace(/\s/g, "").toUpperCase()
	// Add a space every 4 characters
	return cleanIban.match(/.{1,4}/g)!.join(" ")
}
