export const currencyFormatter = (currency: string) =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency,
	})

export const dashboardCompactNumberFormatter = (locale = "en", maximumFractionDigits = 4) => {
	return Intl.NumberFormat(locale, {
		maximumFractionDigits: maximumFractionDigits,
		notation: "compact",
	})
}
