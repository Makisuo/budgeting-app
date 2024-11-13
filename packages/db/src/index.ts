import { drizzle } from "drizzle-orm/postgres-js"
import * as schema from "./schema"

export { schema }

export * from "drizzle-orm"

export const getDb = (connectionString: string) =>
	drizzle({
		connection: connectionString,
		schema,
	})
