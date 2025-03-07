"use client"

import { useNavigate } from "@tanstack/react-router"
import { IconPersonPasskey } from "justd-icons"
import { useTransition } from "react"
import { Button, Loader } from "ui"
import { authClient } from "~/lib/auth/auth-client"

export function Passkey() {
	const navigate = useNavigate()

	const [isPending, startTransition] = useTransition()

	return (
		<Button
			onPress={() => {
				startTransition(async () => {
					await authClient.signIn.passkey({
						fetchOptions: {
							onSuccess: async () => {
								navigate({
									to: "/",
								})
							},
						},
					})
				})
			}}
			intent="outline"
			isPending={isPending}
			className="w-full"
			type="submit"
		>
			{({ isPending }) => (
				<>
					{isPending ? (
						<Loader className="size-4" variant="spin" />
					) : (
						<div className="flex items-center gap-2">
							<IconPersonPasskey />
							<span>
								<span className="hidden sm:inline">Sign in with </span>Passkey
							</span>
						</div>
					)}
				</>
			)}
		</Button>
	)
}
