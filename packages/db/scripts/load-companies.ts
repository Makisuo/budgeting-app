import { drizzle } from "drizzle-orm/postgres-js"
import { schema } from ".."

import { companies } from "../data/companies.ts"

const db = drizzle(process.env.DATABASE_URL!, {
	schema,
	casing: "snake_case",
})

console.info(`Loaded ${companies.length} companies`)

console.time("Insert Companies")

for (const company of companies) {
	await db
		.insert(schema.companies)
		.values(company)
		.onConflictDoUpdate({
			target: schema.companies.id,
			set: {
				name: company.name,
				assetType: company.assetType,
				assetId: company.assetId,
				patterns: company.patterns,
			},
		})
}

console.timeEnd("Insert Companies")

process.exit(0)
