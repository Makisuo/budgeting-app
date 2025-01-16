import { createFileRoute } from "@tanstack/react-router"

import { useTransition } from "react"
import { toast } from "sonner"
import { Button, Card, Form, Link, Loader, TextField } from "ui"
import { authClient } from "~/lib/auth/auth-client"

const metadata = {
	title: "Forgot Password",
	description: "Reset your password by following the instructions sent to your email.",
}

export const Route = createFileRoute("/auth/forgot-password")({
	component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
	const [isPending, startTransition] = useTransition()

	return (
		<>
			<Card.Header className="mb-6 p-0" title={metadata.title} description={metadata.description} />
			<Form
				className="space-y-6"
				onSubmit={(e) => {
					e.preventDefault()
					startTransition(async () => {
						const formData = new FormData(e.currentTarget)

						const email = formData.get("email") as string

						await authClient.forgetPassword({
							email,
							fetchOptions: {
								onSuccess: () => {
									toast.success("Password reset email sent successfully.")
								},
								onError: (ctx) => {
									toast.error(ctx.error.message)
								},
							},
						})
					})
				}}
			>
				<TextField isRequired name="email" label="Email" type="email" placeholder="john@doe.com" />
				<div className="flex items-center justify-between">
					<Link intent="secondary" href="/auth/login">
						Cancel
					</Link>
					<Button type="submit" isPending={isPending}>
						{({ isPending }) => <>{isPending ? <Loader className="size-4" /> : "Send Reset Link"}</>}
					</Button>
				</div>
			</Form>
		</>
	)
}
