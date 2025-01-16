import { createFileRoute } from "@tanstack/react-router"
import { type } from "arktype"
import { IconSend } from "justd-icons"
import { toast } from "sonner"
import { Button, Card } from "~/components/ui"
import { authClient } from "~/lib/auth/auth-client"

const searchType = type({
	email: "string.email",
})

export const Route = createFileRoute("/auth/verify-email")({
	component: VerifyEmailPage,
	validateSearch: searchType,
})

function VerifyEmailPage() {
	const { email } = Route.useSearch()

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
							email: email,
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
