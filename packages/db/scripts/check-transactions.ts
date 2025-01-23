import { drizzle } from "drizzle-orm/postgres-js"
import { schema } from ".."

console.log(process.env.DATABASE_URL)

const db = drizzle(process.env.DATABASE_URL!, {
	schema,
	casing: "snake_case",
})

const checkTransactions = async () => {
	const transactions = await db.query.transactions.findMany({
		where: (table, { isNull }) => isNull(table.companyId),
		limit: 10,
	})

	console.log(transactions)
}

checkTransactions()
