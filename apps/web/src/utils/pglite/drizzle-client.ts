import { schema } from "db"
import { createDrizzle } from "pglite-drizzle/react"

export const { useDrizzleLive, useDrizzleLiveIncremental, syncShapeToTable, useDrizzlePGlite } = createDrizzle({
	schema,
	casing: "camelCase",
})
