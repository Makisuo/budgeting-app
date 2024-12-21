import type { PGlite } from "@electric-sql/pglite"
import { PgDialect } from "drizzle-orm/pg-core"

import { drizzle } from "drizzle-orm/pglite"

import { frontMigrations } from "db"
import { syncShapeToTable } from "./drizzle-client"

export async function runMigrations(pg: PGlite, dbName: string, firstTry = true) {
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

const getBearer = async (): Promise<string> => {
	const bc = new BroadcastChannel("auth")

	return new Promise((resolve) => {
		bc.onmessage = (event) => {
			if (event.data.type !== "bearer") return
			bc.close()
			resolve(event.data.payload as string)
		}
	})
}

const requestBearer = async () => {
	const bc = new BroadcastChannel("auth")
	bc.postMessage({ type: "request", payload: null })

	console.info("REQUESTING_BEARER")

	return await getBearer()
}

export type TableToSync = {
	table: string
	primaryKey: string
}

export async function syncTables(pg: any, electricUrl: string, tables: TableToSync[]) {
	const bearer = await requestBearer()

	const errorHandler = async (error: Error) => {
		if (error && (error as any).status === 401) {
			const token = await requestBearer()
			return {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		}

		throw error
	}

	for (const table of tables) {
		await syncShapeToTable(pg, {
			table: table.table as any,
			primaryKey: table.primaryKey as any,
			shapeKey: table.table,
			shape: {
				url: electricUrl,
				headers: {
					Authorization: `Bearer ${bearer}`,
				},
				onError: errorHandler,
			},
		})
	}
}
