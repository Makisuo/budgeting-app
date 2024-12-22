import { defineConfig } from "drizzle-kit"

export const migrationsFolder = "./migrations"

export default defineConfig({
	out: migrationsFolder,
	schema: "./schema/*",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
	casing: "snake_case",
	verbose: true,
})
