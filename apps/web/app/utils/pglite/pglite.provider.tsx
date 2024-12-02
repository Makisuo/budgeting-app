import { type PGliteWithLive, live } from "@electric-sql/pglite/live"
import { useEffect, useState } from "react"

import { PGliteProvider } from "@electric-sql/pglite-react"
// @ts-expect-error
import PGWorker from "./pglite.worker.js?worker"

import { PGliteWorker } from "@electric-sql/pglite/worker"

const loadPglite = async () => {
	const pgPromise = PGliteWorker.create(new PGWorker(), {
		extensions: {
			live,
		},
	})

	const pg = await pgPromise
	return pg
}

export const PgLiteProvider = ({ children }: { children: React.ReactNode }) => {
	const [pgForProvider, setPgForProvider] = useState<PGliteWithLive | undefined>(undefined)

	useEffect(() => {
		loadPglite().then(setPgForProvider)
	}, [])

	if (!pgForProvider) return <div>Loading...</div>

	return <PGliteProvider db={pgForProvider}>{children}</PGliteProvider>
}
