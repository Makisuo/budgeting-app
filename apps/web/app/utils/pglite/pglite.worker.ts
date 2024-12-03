import { IdbFs, PGlite } from "@electric-sql/pglite"
import { electricSync } from "@electric-sql/pglite-sync"
import { live } from "@electric-sql/pglite/live"
import { type PGliteWorkerOptions, worker } from "@electric-sql/pglite/worker"

import M1 from "./migrations.sql?raw"

const ELECTRIC_URL = new URL("/api/electric/v1/shape", import.meta.env.VITE_BASE_URL).href

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

		await pg.exec(M1)

		await pg.electric.syncShapeToTable({
			shape: {
				url: ELECTRIC_URL,
				table: "institutions",
				onError: (error) => console.log(error),
			},
			table: "institutions",
			primaryKey: ["id"],
		})

		await pg.electric.syncShapeToTable({
			shape: {
				url: ELECTRIC_URL,
				table: "accounts",

				onError: (error) => console.log(error),
			},
			table: "accounts",
			primaryKey: ["id"],
		})

		await pg.electric.syncShapeToTable({
			shape: {
				url: ELECTRIC_URL,
				table: "transactions",
				onError: (error) => console.log(error),
			},
			table: "transactions",
			primaryKey: ["id"],
		})

		// await runMigrations(pg, DB_NAME)
		// await syncTables(pg, ELECTRIC_URL)

		return pg
	},
})
