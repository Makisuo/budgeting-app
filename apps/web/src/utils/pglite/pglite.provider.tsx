import { type PGliteWithLive, live } from "@electric-sql/pglite/live"
import { useCallback, useEffect, useState } from "react"

import { PGliteProvider } from "@electric-sql/pglite-react"

import PGWorker from "./pglite.worker.js?worker"

import { PGliteWorker } from "@electric-sql/pglite/worker"
import { LoadingScreen } from "~/components/loading-screen"

export const PgLiteProvider = ({ children }: { children: React.ReactNode }) => {
	// TODO: add jwt here

	const [pgForProvider, setPgForProvider] = useState<PGliteWithLive | undefined>(undefined)

	const sendToken = useCallback(async () => {
		const bc = new BroadcastChannel("auth")
		bc.postMessage({ type: "bearer", payload: "" })
	}, [])

	useEffect(() => {
		const bc = new BroadcastChannel("auth")
		bc.onmessage = (event) => {
			if (event.data.type !== "request") return

			sendToken().then(() => console.log("SEND_TOKEN"))
		}

		return () => {
			bc.close()
		}
	}, [sendToken])

	useEffect(() => {
		const loadPglite = async () => {
			const pgPromise = PGliteWorker.create(new PGWorker(), {
				extensions: {
					live,
				},
			})

			const pg = await pgPromise

			await pg.waitReady

			return pg
		}
		loadPglite().then(setPgForProvider)
	}, [])

	if (!pgForProvider) return <LoadingScreen />

	return <PGliteProvider db={pgForProvider}>{children}</PGliteProvider>
}
