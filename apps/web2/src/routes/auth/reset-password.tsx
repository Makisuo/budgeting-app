import { createFileRoute } from "@tanstack/react-router"
import { useTransition } from "react"
import { toast } from "sonner"
import { Button, Card, Form, Link, Loader, TextField } from "~/components/ui"
import { authClient } from "~/lib/auth/auth-client"

const metadata = {
	title: "Reset Password",
	description: "Enter a new password to complete the reset process and regain access to your account.",
}

export const Route = createFileRoute("/auth/reset-password")({
	component: ResetPasswordPage,
})

function ResetPasswordPage() {
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

						const password = formData.get("password") as string
						const confirmPassword = formData.get("confirm-password") as string

						if (password !== confirmPassword) {
							toast.error("Passwords do not match.")
							return
						}

						await authClient.resetPassword({
							newPassword: password,
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
				<TextField isRequired name="password" label="New Password" type="password" />
				<TextField isRequired name="confirm-password" isRevealable label="Confirm Password" type="password" />
				<div className="flex items-center justify-between">
					<Link intent="secondary" href="/auth/login">
						Cancel
					</Link>
					<Button type="submit" isPending={isPending}>
						{({ isPending }) => <>{isPending ? <Loader className="size-4" /> : "Reset Password"}</>}
					</Button>
				</div>
			</Form>
		</>
	)
}
