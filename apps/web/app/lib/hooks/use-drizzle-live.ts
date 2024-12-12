import type { PgliteDatabase } from "drizzle-orm/pglite"

import { createDrizzle } from "@makisuo/pglite-drizzle/react"
import { schema } from "db"

export type DrizzleClient = PgliteDatabase<typeof schema>

export const { useDrizzleLive, useDrizzleLiveIncremental } = createDrizzle({ schema, casing: "camelCase" })
