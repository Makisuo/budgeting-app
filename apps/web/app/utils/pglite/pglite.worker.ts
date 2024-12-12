import { IdbFs, PGlite } from "@electric-sql/pglite"
import { type SyncShapeToTableOptions, type SyncShapeToTableResult, electricSync } from "@electric-sql/pglite-sync"
import { live } from "@electric-sql/pglite/live"
import { type PGliteWorkerOptions, worker } from "@electric-sql/pglite/worker"

import type { ShapeStreamOptions } from "@electric-sql/client"

import type { schema } from "db"
import type { ExtractTablesWithRelations } from "drizzle-orm"
import M1 from "./migrations.sql?raw"

const ELECTRIC_URL = new URL("/api/electric/v1/shape", import.meta.env.VITE_BASE_URL).href

export const DB_NAME = "maple_db"

export type ExtractedTables = ExtractTablesWithRelations<typeof schema>

const syncTable = <
	TTableKey extends keyof ExtractedTables,
	TPrimaryKey extends keyof ExtractedTables[TTableKey]["columns"],
>(
	pgLite: PGlite & {
		electric: {
			initMetadataTables: () => Promise<void>
			syncShapeToTable: (options: SyncShapeToTableOptions) => Promise<SyncShapeToTableResult>
		}
	},
	options: {
		table: TTableKey
		primaryKey: TPrimaryKey
	} & Omit<SyncShapeToTableOptions, "table" | "primaryKey">,
) => {
	return pgLite.electric.syncShapeToTable({
		shape: options.shape,
		table: options.table,
		primaryKey: [options.primaryKey as string],
		shapeKey: options.shapeKey,
	})
}

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

		await syncTable(pg, {
			table: "institutions",
			primaryKey: "id",
			shapeKey: "institutions",
			shape: {
				url: ELECTRIC_URL,
				onError: (error) => console.log(error),
				params: {
					table: "institutions",
				},
			},
		})

		await syncTable(pg, {
			table: "accounts",
			primaryKey: "id",
			shapeKey: "accounts",
			shape: {
				url: ELECTRIC_URL,
				onError: (error) => console.log(error),
				params: {
					table: "accounts",
				},
			},
		})

		await syncTable(pg, {
			table: "transactions",
			primaryKey: "id",
			shapeKey: "transactions",
			shape: {
				url: ELECTRIC_URL,
				onError: (error) => console.log(error),
				params: {
					table: "transactions",
				},
			},
		})

		// await runMigrations(pg, DB_NAME)
		// await syncTables(pg, ELECTRIC_URL)

		return pg
	},
})
