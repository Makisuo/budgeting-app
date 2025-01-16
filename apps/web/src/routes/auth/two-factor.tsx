import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useTransition } from "react"
import { toast } from "sonner"
import { Button, Card, Form, InputOTP } from "~/components/ui"
import { authClient } from "~/lib/auth/auth-client"

export const Route = createFileRoute("/auth/two-factor")({
	component: TwoFactorPage,
})

function RouteComponent() {
	return <div>Hello "/auth/two-factor"!</div>
}

function TwoFactorPage() {
	const navigate = useNavigate()

	const [isPending, startTransition] = useTransition()

	return (
		<>
			<Card className="w-[350px]">
				<Card.Header title="TOTP Verification" description="Enter your 6-digit TOTP code to authenticate" />
				<Card.Content>
					<Form
						onSubmit={(e) => {
							e.preventDefault()

							startTransition(async () => {
								const formData = new FormData(e.currentTarget)

								const totpCode = formData.get("totp") as string

								await authClient.twoFactor.verifyTotp({
									code: totpCode,
									fetchOptions: {
										onSuccess: (ctx) => {
											toast.success("Successfully verified 2FA")
											navigate({ to: "/" })
										},
										onError: (ctx) => {
											toast.error(ctx.error.message)
										},
									},
								})
							})
						}}
					>
						<div className="space-y-2">
							<InputOTP name="totp" id="totp" maxLength={6} minLength={6}>
								<InputOTP.Group>
									{[...Array(6)].map((_, index) => (
										<InputOTP.Slot key={index} index={index} />
									))}
								</InputOTP.Group>
							</InputOTP>
						</div>

						<Button type="submit" className="mt-4 w-full">
							Verify
						</Button>
					</Form>
				</Card.Content>
			</Card>
		</>
	)
}
