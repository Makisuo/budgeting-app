import { drizzle } from "drizzle-orm/postgres-js"
import { schema } from ".."

import { companies } from "../data/companies.ts"

const db = drizzle(process.env.DATABASE_URL!, {
	schema,
})

console.info(`Loaded ${companies.length} companies`)

console.time("Insert Companies")

for (const company of companies) {
	db.insert(schema.companies)
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
