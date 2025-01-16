export const currencyFormatter = (currency: string) =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency,
	})
