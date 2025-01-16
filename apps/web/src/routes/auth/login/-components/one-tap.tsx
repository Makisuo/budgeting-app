"use client"

import { Fragment, useEffect } from "react"
import { authClient } from "~/lib/auth/auth-client"

export const OneTap = () => {
	const loadOneTap = async () => {
		await authClient.oneTap()
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		loadOneTap()
	}, [])

	return <Fragment />
}
