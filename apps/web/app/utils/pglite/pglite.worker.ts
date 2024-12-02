import { PGlite } from "@electric-sql/pglite"
import { electricSync } from "@electric-sql/pglite-sync"
import { live } from "@electric-sql/pglite/live"
import { type PGliteWorkerOptions, worker } from "@electric-sql/pglite/worker"

// @ts-expect-error
import M1 from "./migrations.sql?raw"

const ELECTRIC_URL = import.meta.env.VITE_APP_ELECTRIC_URL

export const DB_NAME = "maple_db"

worker({
	async init(options: PGliteWorkerOptions) {
		const pg = await PGlite.create({
			dataDir: `idb://${DB_NAME}`,
			relaxedDurability: true,
			extensions: {
				electric: electricSync({ debug: options?.debug !== undefined }),
				live,
			},
			debug: options.debug,
		})

		await pg.exec(M1)

		const shape = await pg.electric.syncShapeToTable({
			shape: {
				url: new URL("/v1/shape", ELECTRIC_URL).href,
				table: "institutions",
				onError: (error) => console.log(error),
			},
			table: "institutions",
			primaryKey: ["id"],
		})

		console.log(await pg.exec("SELECT * FROM institutions"))

		const shape1 = await pg.electric.syncShapeToTable({
			shape: {
				url: new URL("/v1/shape", ELECTRIC_URL).href,
				table: "accounts",
				onError: (error) => console.log(error),
			},
			table: "accounts",
			primaryKey: ["id"],
		})

		const shape2 = await pg.electric.syncShapeToTable({
			shape: {
				url: new URL("/v1/shape", ELECTRIC_URL).href,
				table: "transactions",
				onError: (error) => console.log(error),
			},
			table: "transactions",
			primaryKey: ["id"],
		})

		console.log(shape2)

		console.log(await pg.exec("SELECT * FROM transactions"))
		console.log(await pg.exec("SELECT * FROM accounts"))

		// await runMigrations(pg, DB_NAME)
		// await syncTables(pg, ELECTRIC_URL)

		return pg
	},
})
