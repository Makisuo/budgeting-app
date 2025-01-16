"use client"

import { authClient } from "@/lib/auth/auth-client"
import { Fragment, useEffect } from "react"

export const OneTap = () => {
	const loadOneTap = async () => {
		await authClient.oneTap()
	}
	useEffect(() => {
		loadOneTap()
	}, [])

	return <Fragment />
}
