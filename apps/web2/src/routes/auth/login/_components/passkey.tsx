"use client"

import { authClient } from "@/lib/auth/auth-client"
import { appConfig } from "@/lib/config"
import { IconPersonPasskey } from "justd-icons"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Button, Loader } from "ui"

export function Passkey() {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()

	return (
		<Button
			ref={() => {
				if (
					!PublicKeyCredential.isConditionalMediationAvailable ||
					!PublicKeyCredential.isConditionalMediationAvailable()
				) {
					return
				}

				void authClient.signIn.passkey({
					autoFill: true,
					fetchOptions: { onSuccess: async () => router.push(appConfig.dashboardPath) },
				})
			}}
			onPress={() => {
				startTransition(async () => {
					await authClient.signIn.passkey({
						fetchOptions: { onSuccess: async () => router.push(appConfig.dashboardPath) },
					})
				})
			}}
			appearance="outline"
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
