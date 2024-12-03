import { useLiveIncrementalQuery, useLiveQuery, usePGlite } from "@electric-sql/pglite-react"
import {
	type BuildRelationalQueryResult,
	Column,
	One,
	SQL,
	type TableRelationalConfig,
	type TablesRelationalConfig,
	is,
} from "drizzle-orm"
import type { PgRelationalQuery } from "drizzle-orm/pg-core/query-builders/query"
import { drizzle as PgLiteDrizzle, type PgliteDatabase } from "drizzle-orm/pglite"

import { schema } from "db"

export type DrizzleClient = PgliteDatabase<typeof schema>

const createPgLiteClient = (client: any) => {
	return PgLiteDrizzle(client, {
		schema,
	})
}

const useDrizzleLiveImlp = <T extends PgRelationalQuery<unknown>>(fn: (db: DrizzleClient) => T) => {
	const pg = usePGlite()

	const drizzle = createPgLiteClient(pg)

	const query = fn(drizzle)
	const sqlData = query.toSQL()

	const drizzleInternalQuery = (query as any)._getQuery()

	const items = useLiveQuery(sqlData.sql, sqlData.params)

	const mode: "many" | "one" = (query as any).mode

	const rawRows = items?.rows || []

	const mappedRows = rawRows.map((row) => {
		return Object.fromEntries(
			Object.entries(row).map(([key, value]) => {
				if (Array.isArray(value)) {
					return [
						key,
						// @ts-expect-error This uses a bunch of drizzle internal fields
						mapRelationalRow(query.schema, query.tableConfig, value, drizzleInternalQuery.selection),
					]
				}

				return [key, value]
			}),
		)
	})

	const data = mode === "many" ? mappedRows : mappedRows[0] || undefined

	return {
		data: data as Awaited<T>,
		affectedRows: items?.affectedRows || 0,
		fields: items?.fields || [],
		blob: items?.blob,
	}
}

const useDrizzleLiveIncrementalImpl = <T extends PgRelationalQuery<unknown>>(
	diffKey: string,
	fn: (db: DrizzleClient) => T,
) => {
	const pg = usePGlite()

	const drizzle = createPgLiteClient(pg)

	const query = fn(drizzle)
	const sqlData = query.toSQL()

	const drizzleInternalQuery = (query as any)._getQuery()

	const items = useLiveIncrementalQuery(sqlData.sql, sqlData.params, diffKey)

	const mode: "many" | "one" = (query as any).mode

	const rawRows = items?.rows || []

	const mappedRows = rawRows.map((row) => {
		return Object.fromEntries(
			Object.entries(row).map(([key, value]) => {
				if (Array.isArray(value)) {
					return [
						key,
						// @ts-expect-error This uses a bunch of drizzle internal fields
						mapRelationalRow(query.schema, query.tableConfig, value, drizzleInternalQuery.selection),
					]
				}

				return [key, value]
			}),
		)
	})

	const data = mode === "many" ? mappedRows : mappedRows[0] || undefined

	return {
		data: data as Awaited<T>,
		affectedRows: items?.affectedRows || 0,
		fields: items?.fields || [],
		blob: items?.blob,
	}
}

export const useDrizzleLive = <T extends PgRelationalQuery<unknown>>(fn: (db: DrizzleClient) => T) => {
	return useDrizzleLiveImlp(fn)
}

/*
This hook is better for reactivity but doesnt work with include queries 
*/
export const useDrizzleLiveIncremental = <T extends PgRelationalQuery<unknown>>(
	diffKey: string,
	fn: (db: DrizzleClient) => T,
) => {
	return useDrizzleLiveIncrementalImpl(diffKey, fn)
}

function mapRelationalRow(
	tablesConfig: TablesRelationalConfig,
	tableConfig: TableRelationalConfig,
	row: unknown[],
	buildQueryResultSelection: BuildRelationalQueryResult["selection"],
	mapColumnValue: (value: unknown) => unknown = (value) => value,
): Record<string, unknown> {
	const result: Record<string, unknown> = {}

	for (const [selectionItemIndex, selectionItem] of buildQueryResultSelection.entries()) {
		if (selectionItem.isJson) {
			const relation = tableConfig.relations[selectionItem.tsKey]!
			const rawSubRows = row[selectionItemIndex] as unknown[] | null | [null] | string
			const subRows = typeof rawSubRows === "string" ? (JSON.parse(rawSubRows) as unknown[]) : rawSubRows
			result[selectionItem.tsKey] = is(relation, One)
				? subRows &&
					mapRelationalRow(
						tablesConfig,
						tablesConfig[selectionItem.relationTableTsKey!]!,
						subRows,
						selectionItem.selection,
						mapColumnValue,
					)
				: (subRows as unknown[][]).map((subRow) =>
						mapRelationalRow(
							tablesConfig,
							tablesConfig[selectionItem.relationTableTsKey!]!,
							subRow,
							selectionItem.selection,
							mapColumnValue,
						),
					)
		} else {
			const value = mapColumnValue(row[selectionItemIndex])
			const field = selectionItem.field!
			let decoder: any
			if (is(field, Column)) {
				decoder = field
			} else if (is(field, SQL)) {
				// @ts-expect-error Internal field
				decoder = field.decoder
			} else {
				// @ts-expect-error Internal field
				decoder = field.sql.decoder
			}
			result[selectionItem.tsKey] = value === null ? null : decoder.mapFromDriverValue(value)
		}
	}

	return result
}
