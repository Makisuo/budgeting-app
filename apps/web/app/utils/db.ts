import { getDb, type schema } from "db"

export const db = getDb(process.env.DATABASE_URL!)
