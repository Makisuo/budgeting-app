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
	{
		id: 3,
		name: "Amazon",
		assetType: "symbol",
		assetId: "AMZN",
		patterns: ["Amzn Mktp%", "Amznprime%"],
	},
	{
		id: 4,
		name: "Cloudflare",
		assetType: "isin",
		assetId: "US18915M1071",
		patterns: ["cloudflare"],
	},
	{
		id: 5,
		name: "Uber Eats",
		assetType: "isin",
		assetId: "US90353T1007",
		patterns: ["Uber *eats%"],
	},
]
