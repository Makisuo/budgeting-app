import { drizzle } from "drizzle-orm/postgres-js"

export const db = drizzle({
	connection: process.env.DATABASE_URL!,
})

export * from "./auth"
