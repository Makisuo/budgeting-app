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
import { PgRelationalQuery } from "drizzle-orm/pg-core/query-builders/query"
import { drizzle as PgLiteDrizzle, type PgliteDatabase } from "drizzle-orm/pglite"

import type { LiveQueryResults } from "@electric-sql/pglite/live"
import { schema } from "db"
import type { AnyPgSelect } from "drizzle-orm/pg-core"

export type DrizzleClient = PgliteDatabase<typeof schema>

const createPgLiteClient = (client: any) => {
	return PgLiteDrizzle(client, {
		schema,
		casing: "camelCase",
	})
}

function processQueryResults<T>(query: T, rawRows: any[]): Record<string, any>[] {
	return rawRows.map((row) => {
		return mapRelationalRow(
			(query as any).schema,
			(query as any).tableConfig,
			Object.values(row),
			(query as any)._getQuery().selection,
		)
	})
}

function createQueryResult<T extends PgRelationalQuery<unknown> | AnyPgSelect>(
	mappedRows: Record<string, any>[],
	mode: "many" | "one",
	items?: { affectedRows?: number; fields?: any[]; blob?: any },
): { data: Awaited<T> } & Omit<LiveQueryResults<unknown>, "rows"> {
	return {
		data: (mode === "many" ? mappedRows : mappedRows[0] || undefined) as Awaited<T>,
		affectedRows: items?.affectedRows || 0,
		fields: items?.fields || [],
		blob: items?.blob,
	}
}

export const useDrizzleLive = <T extends PgRelationalQuery<unknown> | AnyPgSelect>(fn: (db: DrizzleClient) => T) => {
	const pg = usePGlite()

	const drizzle = createPgLiteClient(pg)
	const query = fn(drizzle)

	const sqlData = query.toSQL()
	const items = useLiveQuery(sqlData.sql, sqlData.params)

	if (is(query, PgRelationalQuery)) {
		const mode = (query as any).mode
		const mappedRows = processQueryResults(query, items?.rows || [])

		return createQueryResult<T>(mappedRows, mode, items)
	}

	return createQueryResult<T>(items?.rows || [], "many", items)
}

/*
This hook is better for reactivity but doesnt work with include queries 
*/
export const useDrizzleLiveIncremental = <T extends PgRelationalQuery<unknown> | AnyPgSelect>(
	diffKey: string,
	fn: (db: DrizzleClient) => T,
) => {
	const pg = usePGlite()
	const drizzle = createPgLiteClient(pg)
	const query = fn(drizzle)
	const sqlData = query.toSQL()
	const items = useLiveIncrementalQuery(sqlData.sql, sqlData.params, diffKey)

	if (is(query, PgRelationalQuery)) {
		const mode = (query as any).mode
		const mappedRows = processQueryResults(query, items?.rows || [])

		return createQueryResult<T>(mappedRows, mode, items)
	}

	return createQueryResult<T>(items?.rows || [], "many", items)
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
