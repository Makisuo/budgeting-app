import type { Company } from ".."

export const companies: Company[] = [
	{
		id: "apple",
		name: "Apple",
		url: "apple.com",
		patterns: ["apple.com%"],
	},
	{
		id: "paypal",
		name: "PayPal",
		url: "paypal.com",
		patterns: ["PayPal%"],
	},
	{
		id: "amazon",
		name: "Amazon",
		url: "amazon.com",
		patterns: ["Amzn Mktp%", "Amznprime%"],
	},
	{
		id: "cloudflare",
		name: "Cloudflare",
		url: "cloudflare.com",
		patterns: ["cloudflare"],
	},
	{
		id: "ubereats",
		name: "Uber Eats",
		url: "ubereats.com",
		patterns: ["Uber *eats%"],
	},
	{
		id: "vodafone",
		name: "Vodafone",
		url: "vodafone.com",
		patterns: ["Vodafone%"],
	},
	{
		id: "vattenfall",
		name: "Vattenfall",
		url: "vattenfall.de",
		patterns: ["VATTENFALL EUROPE%"],
	},
	{
		id: "sparkasse",
		name: "Sparkasse",
		url: "sparkasse.de",
		patterns: ["%Sparkasse%"],
	},
	{
		id: "care-germany",
		name: "Care",
		url: "care.de",
		patterns: ["CARE Deutschland e.V."],
	},
	{
		id: "telekom",
		name: "Telekom",
		url: "telekom.de",
		patterns: ["%Telekom%"],
	},
	{
		id: "myplace-selfstorage",
		name: "Myplace Self Storage",
		url: "myplace.de",
		patterns: ["SelfStorage-Dein Lagerraum GmbH"],
	},
	{
		id: "supermaven",
		name: "Supermaven",
		url: "supermaven.com",
		patterns: ["Supermaven, Inc."],
	},
	{
		id: "neon-tech",
		name: "Neon Tech",
		url: "neon.tech",
		patterns: ["Neon.tech"],
	},
	{
		id: "porkbun",
		name: "Porkbun",
		url: "porkbun.com",
		patterns: ["Porkbun.com"],
	},
	{
		id: "1password",
		name: "1Password",
		url: "1password.com",
		patterns: ["1password"],
	},
	{
		id: "perplexity",
		name: "Perplexity",
		url: "perplexity.com",
		patterns: ["www.perplexity.ai"],
	},
	{
		id: "lidl",
		name: "Lidl",
		url: "lidl.de",
		patterns: ["Lidl Sagt Danke"],
	},
	{
		id: "rossmann",
		name: "Rossmann",
		url: "rossmann.de",
		patterns: ["Rossmann%"],
	},
	{
		id: "wolt",
		name: "Wolt",
		url: "wolt.com",
		patterns: ["Wolt"],
	},
]
