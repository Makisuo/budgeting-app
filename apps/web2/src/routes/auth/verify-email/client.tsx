"use client"

import { authClient } from "@/lib/auth/auth-client"
import { IconSend } from "justd-icons"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button, Card } from "ui"

export function Client() {
	const params = useSearchParams()

	return (
		<Card>
			<Card.Header
				title="Verify Email"
				description="Before continuing, could you verify your email address by clicking on the link we just emailed to you? If you didn't receive the email, we will gladly send you another."
			/>
			<Card.Footer className="justify-between">
				<Button
					onPress={() => {
						toast("Sending verification email...")

						authClient.sendVerificationEmail({
							email: params.get("email")!,
							fetchOptions: {
								onSuccess: () => {
									toast.success("Verification email sent successfully.")
								},
								onError: (ctx) => {
									toast.error(ctx.error.message)
								},
							},
						})
					}}
				>
					<IconSend />
					Resend Verification Email
				</Button>
			</Card.Footer>
		</Card>
	)
}
