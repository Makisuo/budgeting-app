import { drizzle } from "drizzle-orm/postgres-js"
import { schema } from "../index.ts"

import { categories } from "../data/categories.ts"
import { companies } from "../data/companies.ts"

const db = drizzle(process.env.DATABASE_URL!, {
	schema,
	casing: "snake_case",
})

console.info(`Loaded ${companies.length} companies`)

console.time(`Inserted ${companies.length} companies`)

for (const company of companies) {
	await db
		.insert(schema.companies)
		.values(company)
		.onConflictDoUpdate({
			target: schema.companies.id,
			set: {
				name: company.name,
				url: company.url,
				patterns: company.patterns,
			},
		})
}

console.timeEnd(`Inserted ${companies.length} companies`)

console.time("Insert Categories")

for (const category of categories) {
	await db
		.insert(schema.categories)
		.values(category)
		.onConflictDoUpdate({
			target: schema.categories.id,
			set: {
				name: category.name,
				type: category.type,
			},
		})
}

console.time("Insert Categories")

process.exit(0)
