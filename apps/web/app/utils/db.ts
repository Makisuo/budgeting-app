import { getDb, schema } from "db"

export const db = getDb(process.env.DATABASE_URL!)
