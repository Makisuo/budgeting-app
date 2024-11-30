const ELECTRIC_URL = import.meta.env.VITE_APP_ELECTRIC_URL

export const bankAccountShape = () => ({
	url: new URL("/v1/shape", ELECTRIC_URL).href,
	table: "accounts",
})

export const transactionShape = () => ({
	url: new URL("/v1/shape", ELECTRIC_URL).href,
	table: "transactions",
})

export const institutionShape = () => ({
	url: new URL("/v1/shape", ELECTRIC_URL).href,
	table: "institutions",
})
