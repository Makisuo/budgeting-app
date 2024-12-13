import { IdbFs, PGlite } from "@electric-sql/pglite"
import { electricSync } from "@electric-sql/pglite-sync"
import { live } from "@electric-sql/pglite/live"
import { type PGliteWorkerOptions, worker } from "@electric-sql/pglite/worker"

import { frontMigrations, type schema } from "db"
import type { ExtractTablesWithRelations } from "drizzle-orm"
import { PgDialect } from "drizzle-orm/pg-core"
import { drizzle } from "drizzle-orm/pglite"
import { syncShapeToTable } from "~/lib/hooks/use-drizzle-live"

const ELECTRIC_URL = new URL("/api/electric/v1/shape", import.meta.env.VITE_BASE_URL).href

export const DB_NAME = "maple_db"

export type ExtractedTables = ExtractTablesWithRelations<typeof schema>

worker({
	async init(options: PGliteWorkerOptions) {
		const pg = await PGlite.create({
			fs: new IdbFs(DB_NAME),
			relaxedDurability: true,
			extensions: {
				electric: electricSync({ debug: options?.debug !== undefined }),
				live,
			},
			debug: options.debug,
		})

		await runMigrations(pg, DB_NAME)

		await syncShapeToTable(pg, {
			table: "institutions",
			primaryKey: "id",
			shapeKey: "institutions",
			shape: {
				url: ELECTRIC_URL,
				onError: (error) => console.log(error),
			},
		})

		await syncShapeToTable(pg, {
			table: "accounts",
			primaryKey: "id",
			shapeKey: "accounts",
			shape: {
				url: ELECTRIC_URL,
				onError: (error) => console.log(error),
			},
		})

		await syncShapeToTable(pg, {
			table: "transactions",
			primaryKey: "id",
			shapeKey: "transactions",
			shape: {
				url: ELECTRIC_URL,
				onError: (error) => console.log(error),
			},
		})

		await syncShapeToTable(pg, {
			table: "companies",
			primaryKey: "id",
			shapeKey: "companies",
			shape: {
				url: ELECTRIC_URL,
				onError: (error) => console.log(error),
			},
		})

		// await runMigrations(pg, DB_NAME)
		// await syncTables(pg, ELECTRIC_URL)

		return pg
	},
})

async function runMigrations(pg: PGlite, dbName: string, firstTry = true) {
	const db = drizzle(pg)

	const start = performance.now()
	try {
		await new PgDialect().migrate(
			frontMigrations,
			//@ts-ignore
			db._.session,
			dbName,
		)
		console.info(`✅ Local database ready in ${performance.now() - start}ms`)
	} catch (cause) {
		console.error("❌ Local database schema migration failed", cause)

		if (firstTry) {
			indexedDB.deleteDatabase(dbName)
			return runMigrations(pg, dbName, false)
		}

		throw cause
	}

	return pg
}
