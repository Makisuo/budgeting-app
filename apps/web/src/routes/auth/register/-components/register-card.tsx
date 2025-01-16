import { Card, ShowMore } from "~/components/ui"
import { AUTH_PROVIDERS, ONE_TAP_ENABLED } from "~/lib/auth/auth-static"
import { OAuthButton } from "../../login/-components/oauth-button"
import { OneTap } from "../../login/-components/one-tap"
import { RegisterCredentialsForm } from "./register-credentials-form"

export const RegisterCard = () => {
	return (
		<div className="flex w-full flex-col gap-y-4">
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
