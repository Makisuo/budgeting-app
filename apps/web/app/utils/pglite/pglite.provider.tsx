import { type PGliteWithLive, live } from "@electric-sql/pglite/live"
import { useEffect, useState } from "react"

import { PGliteProvider } from "@electric-sql/pglite-react"

import PGWorker from "./pglite.worker.js?worker"

import { PGliteWorker } from "@electric-sql/pglite/worker"
import { LoadingScreen } from "~/components/loading-screen"

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

	if (!pgForProvider) return <LoadingScreen />

	return <PGliteProvider db={pgForProvider}>{children}</PGliteProvider>
}
