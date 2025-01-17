"use client"

import { useNavigate } from "@tanstack/react-router"
import { useTransition } from "react"
import { toast } from "sonner"
import { Button, Form, Link, Loader, TextField } from "ui"
import { authClient } from "~/lib/auth/auth-client"

export function RegisterCredentialsForm() {
	const navigate = useNavigate()

	const [isPending, startTransition] = useTransition()

	async function register(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()

		startTransition(async () => {
			const formData = new FormData(e.currentTarget)

			const name = formData.get("name") as string

			const email = formData.get("email") as string
			const password = formData.get("password") as string

			await authClient.signUp.email(
				{
					name,
					email,
					password,
					callbackURL: "/",
				},
				{
					onSuccess: async () => {
						navigate({ to: "/auth/verify-email", search: { email } })
					},
					onError: (ctx) => {
						toast.error(ctx.error.message)
					},
				},
			)
		})
	}

	return (
		<>
			<Form onSubmit={register} className="space-y-3">
				<TextField isRequired name="name" label="Name" type="text" autoComplete="name" />
				<TextField isRequired name="email" label="Email" type="email" autoComplete="email webauthn" />
				<TextField
					isRequired
					name="password"
					label="Password"
					type="password"
					autoComplete="current-password webauthn"
					isRevealable
				/>
				<Button isPending={isPending} className="w-full" type="submit">
					{({ isPending }) => <>{isPending ? <Loader className="size-4" /> : "Sign up"}</>}
				</Button>
			</Form>

			<p className="text-muted-fg text-sm">
				Already have an account?{" "}
				<Link className="text-fg" href="/auth/login">
					Sign In
				</Link>
			</p>
		</>
	)
}
