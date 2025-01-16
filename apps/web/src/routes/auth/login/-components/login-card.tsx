import { Card, Link, ShowMore } from "~/components/ui"
import { AUTH_PROVIDERS, ONE_TAP_ENABLED, PASSKEY_ENABLED } from "~/lib/auth/auth-static"
import { Credentials } from "./credentials"
import { OAuthButton } from "./oauth-button"
import { OneTap } from "./one-tap"
import { Passkey } from "./passkey"

export const LoginCard = () => {
	return (
		<div className="flex flex-col gap-y-4">
			<Card.Header
				className="mb-4 p-0"
				title="Login"
				description="Sign in to your account to access your dashboard."
			/>
			<div className="flex flex-col gap-y-1">
				{AUTH_PROVIDERS.map((provider) => (
					<OAuthButton key={provider} provider={provider} />
				))}
			</div>
			{AUTH_PROVIDERS.length > 0 && <ShowMore as="text" text="Or continue with" />}
			<Credentials />
			{PASSKEY_ENABLED && <Passkey />}
			{ONE_TAP_ENABLED && <OneTap />}

			<p className="text-muted-fg text-sm">
				Don't have an account?{" "}
				<Link className="text-fg" href="/auth/register">
					Sign Up
				</Link>
			</p>
		</div>
	)
}
