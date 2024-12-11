import { usePGlite } from "@electric-sql/pglite-react"

import { drizzle as PgLiteDrizzle, type PgliteDatabase } from "drizzle-orm/pglite"

import {
	useDrizzleLive as useDrizzleLiveImpl,
	useDrizzleLiveIncremental as useDrizzleLiveIncrementalImpl,
} from "@makisuo/pglite-drizzle/react"

import type { DrizzleQueryType } from "@makisuo/pglite-drizzle"
import { schema } from "db"

export type DrizzleClient = PgliteDatabase<typeof schema>

export const createPgLiteClient = (client: any) => {
	return PgLiteDrizzle(client, {
		schema,
		casing: "camelCase",
	})
}

export const useDrizzleLive = <T extends DrizzleQueryType>(fn: (db: DrizzleClient) => T) => {
	const pg = usePGlite()

	const drizzle = createPgLiteClient(pg)
	const query = fn(drizzle)

	return useDrizzleLiveImpl<T>(query)
}

/*
This hook is better for reactivity but doesnt work with include queries 
*/
export const useDrizzleLiveIncremental = <T extends DrizzleQueryType>(
	diffKey: string,
	fn: (db: DrizzleClient) => T,
) => {
	const pg = usePGlite()
	const drizzle = createPgLiteClient(pg)

	const query = fn(drizzle)

	return useDrizzleLiveIncrementalImpl(diffKey, query)
}
