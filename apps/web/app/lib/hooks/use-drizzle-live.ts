import { useLiveIncrementalQuery, useLiveQuery, usePGlite } from "@electric-sql/pglite-react"
import type { PgRelationalQuery } from "drizzle-orm/pg-core/query-builders/query"
import { drizzle as PgLiteDrizzle, type PgliteDatabase } from "drizzle-orm/pglite"

import { schema } from "db"

export type DrizzleClient = PgliteDatabase<typeof schema>

const createPgLiteClient = (client: any) => {
	return PgLiteDrizzle(client, {
		schema,
	})
}

export const useDrizzleLive = <T extends unknown[]>(fn: (db: DrizzleClient) => PgRelationalQuery<T>) => {
	const pg = usePGlite()

	const drizzle = createPgLiteClient(pg)

	const data = fn(drizzle).toSQL()

	const items = useLiveQuery<T[0]>(data.sql, data.params)

	return {
		rows: items?.rows || [],
		affectedRows: items?.affectedRows || 0,
		fields: items?.fields || [],
		blob: items?.blob,
	}
}

export const useDrizzleLiveIncremental = <T extends unknown[]>(
    diffKey: string,
    fn: (db: DrizzleClient) => PgRelationalQuery<T>,
) => {
    const pg = usePGlite()
    const drizzle = createPgLiteClient(pg)
    const data = fn(drizzle).toSQL()


    const items = useLiveIncrementalQuery<T[0]>(
        data.sql, 
        data.params, 
        diffKey 
    )

    return {
        rows: items?.rows || [],
        affectedRows: items?.affectedRows || 0,
        fields: items?.fields || [],
        blob: items?.blob,
    }
}

