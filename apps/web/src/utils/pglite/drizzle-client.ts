import { createDrizzle } from "@makisuo/pglite-drizzle/react"
import { schema } from "db"

export const { useDrizzleLive, useDrizzleLiveIncremental, syncShapeToTable, useDrizzlePGlite } = createDrizzle({
	schema,
	casing: "camelCase",
})
