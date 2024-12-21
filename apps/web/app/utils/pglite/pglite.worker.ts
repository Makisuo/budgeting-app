import { IdbFs, PGlite } from "@electric-sql/pglite"
import { electricSync } from "@electric-sql/pglite-sync"
import { live } from "@electric-sql/pglite/live"
import { type PGliteWorkerOptions, worker } from "@electric-sql/pglite/worker"

import { type TableToSync, runMigrations, syncTables } from "./pglite.helpers"

const ELECTRIC_URL = `${import.meta.env.VITE_ELECTRIC_URL}/v1/shape`

export const DB_NAME = "maple_db"

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

		await syncTables(pg, ELECTRIC_URL, tablesToSync)

		return pg
	},
})

const tablesToSync: TableToSync[] = [
	{
		table: "institutions",
		primaryKey: "id",
	},
	{
		table: "accounts",
		primaryKey: "id",
	},
	{
		table: "transactions",
		primaryKey: "id",
	},
	{
		table: "companies",
		primaryKey: "id",
	},
	{
		table: "categories",
		primaryKey: "id",
	},
]
