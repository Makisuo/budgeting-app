"use client"

import { Button, Loader } from "@/components/ui"

import { authClient } from "@/lib/auth/auth-client"
import { appConfig } from "@/lib/config"

import { IconBrandGithub, IconBrandGoogle } from "justd-icons"
import { useRouter } from "next/navigation"
import { type ReactNode, useState, useTransition } from "react"
import { toast } from "sonner"

export type OAuthProvider = "github" | "google"

export interface OAuthButtonProps {
	provider: OAuthProvider
	prefix?: string
	redirect?: string
}

const providers = {
	github: {
		icon: <IconBrandGithub className="size-4" />,
		label: "GitHub",
	},
	google: {
		icon: <IconBrandGoogle />,
		label: "Google",
	},
} satisfies Record<OAuthProvider, { icon: ReactNode; label: string }>

export const OAuthButton = ({ provider, redirect, prefix }: OAuthButtonProps) => {
	const router = useRouter()

	const { icon, label } = providers[provider]

	const [isLastUsed, setIsLastUsed] = useState(false)
	const [isPending, startTransition] = useTransition()

	return (
		<Button
			ref={() => {
				setIsLastUsed(localStorage.getItem("last-used-provider") === provider)
			}}
			className="w-full"
			isPending={isPending}
			size="large"
			appearance="outline"
			onPress={() => {
				startTransition(async () => {
					await authClient.signIn.social({
						provider,
						callbackURL: appConfig.dashboardPath,

						fetchOptions: {
							onSuccess: () => {
								localStorage.setItem("last-used-provider", provider)

								router.push(redirect ?? appConfig.dashboardPath)
							},
							onError: (ctx) => {
								toast.error(ctx.error.message ?? "Failed to sign in", {
									description:
										"Please try again later. If the issue persists, please contact support.",
								})
							},
						},
					})
				})
			}}
		>
			{({ isPending }) => (
				<>
					{isPending ? <Loader className="size-4" variant="spin" /> : icon}
					{prefix && `${prefix} `}
					{label}
					{isLastUsed && (
						<span className="absolute right-4 text-content-subtle text-muted-fg text-xs text-xs">
							{"Last used"}
						</span>
					)}
				</>
			)}
		</Button>
	)
}
