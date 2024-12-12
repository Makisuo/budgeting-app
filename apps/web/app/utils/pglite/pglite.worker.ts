import { IdbFs, PGlite } from "@electric-sql/pglite"
import { electricSync } from "@electric-sql/pglite-sync"
import { live } from "@electric-sql/pglite/live"
import { type PGliteWorkerOptions, worker } from "@electric-sql/pglite/worker"

import type { schema } from "db"
import type { ExtractTablesWithRelations } from "drizzle-orm"
import { syncShapeToTable } from "~/lib/hooks/use-drizzle-live"
import M1 from "./migrations.sql?raw"

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

		await pg.exec(M1)

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

		// await runMigrations(pg, DB_NAME)
		// await syncTables(pg, ELECTRIC_URL)

		return pg
	},
})
