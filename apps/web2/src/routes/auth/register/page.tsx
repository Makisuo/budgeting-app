import { AUTH_PROVIDERS, ONE_TAP_ENABLED } from "@/lib/auth/auth-static"
import { Card, ShowMore } from "ui"
import { OAuthButton } from "../login/_components/oauth-button"
import { OneTap } from "../login/_components/one-tap"
import { RegisterCredentialsForm } from "./_components/register-credentials-form"

export const metadata = {
	title: "Register",
	description: "Sign up to get started using your account.",
}

export default function Page() {
	return (
		<div className="flex flex-col gap-y-4">
			<Card.Header
				className="mb-4 p-0"
				title="Register"
				description="Sign up to get started using your account."
			/>
			<div className="flex flex-col gap-y-1">
				{AUTH_PROVIDERS.map((provider) => (
					<OAuthButton key={provider} provider={provider} />
				))}
			</div>
			{AUTH_PROVIDERS.length > 0 && <ShowMore as="text" text="Or continue with" />}
			<RegisterCredentialsForm />
			{ONE_TAP_ENABLED && <OneTap />}
		</div>
	)
}
