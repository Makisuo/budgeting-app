import { createDrizzle } from "@makisuo/pglite-drizzle/react"
import { schema } from "db"

export const { useDrizzleLive, useDrizzleLiveIncremental } = createDrizzle({ schema, casing: "camelCase" })
