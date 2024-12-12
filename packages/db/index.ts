import type { InferSelectModel } from "drizzle-orm"

import * as schema from "./schema"

import migrations from "./migrations/export.json"

export type Account = InferSelectModel<typeof schema.accounts>
export type Institution = InferSelectModel<typeof schema.institutions>
export type Transaction = InferSelectModel<typeof schema.transactions>

export { schema }

export const frontMigrations = migrations
