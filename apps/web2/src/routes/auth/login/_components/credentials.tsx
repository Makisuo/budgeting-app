"use client"

import { authClient } from "@/lib/auth/auth-client"
import { appConfig } from "@/lib/config"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { Button, Checkbox, Form, Link, Loader, TextField } from "ui"

export function Credentials() {
	const router = useRouter()

	const [isPending, startTransition] = useTransition()

	async function login(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()

		startTransition(async () => {
			const formData = new FormData(e.currentTarget)

			const email = formData.get("email") as string
			const password = formData.get("password") as string

			await authClient.signIn.email(
				{
					email,
					password,
				},
				{
					onError: (ctx) => {
						if (ctx.error.code === "EMAIL_NOT_VERIFIED") {
							router.push(`/auth/verify-email?email=${email}`)
						}

						toast.error(ctx.error.message)
					},
					onSuccess: async () => {
						router.push(appConfig.dashboardPath)
					},
				},
			)
		})
	}

	return (
		<Form onSubmit={login} className="space-y-6">
			<TextField isRequired name="email" label="Email" type="email" autoComplete="email webauthn" />
			<TextField
				isRequired
				name="password"
				label="Password"
				type="password"
				autoComplete="current-password webauthn"
				isRevealable
			/>
			<div className="flex items-center justify-between">
				<Checkbox label="Remember me" />
				<Link className="text-sm" intent="primary" href="/auth/forgot-password">
					Forgot password?
				</Link>
			</div>
			<Button isPending={isPending} className="w-full" type="submit">
				{({ isPending }) => <>{isPending ? <Loader className="size-4" /> : "Login"}</>}
			</Button>
		</Form>
	)
}
