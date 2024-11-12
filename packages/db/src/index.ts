import { drizzle } from "drizzle-orm/postgres-js"

import * as schema from "./schema"

export const db = drizzle({
	connection: process.env.DATABASE_URL!,
	schema,
})

export { schema }

export * from "./auth"
