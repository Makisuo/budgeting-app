import type { Company } from ".."

export const companies: Company[] = [
	{
		id: 1,
		name: "Apple",
		assetType: "symbol",
		assetId: "AAPL",
		patterns: ["apple.com%"],
	},
	{
		id: 2,
		name: "PayPal",
		assetType: "symbol",
		assetId: "PYPL",
		patterns: ["PayPal%"],
	},
]
