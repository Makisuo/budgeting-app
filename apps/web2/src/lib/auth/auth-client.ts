import { adminClient, oneTapClient, passkeyClient, twoFactorClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { toast } from "sonner"

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_BETTER_AUTH_URL,
	plugins: [
		oneTapClient({
			clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
		}),
		adminClient(),
		passkeyClient(),
		twoFactorClient({
			onTwoFactorRedirect() {
				window.location.href = "/auth/two-factor"
			},
		}),
	],
	fetchOptions: {
		onError(e) {
			if (e.error.status === 429) {
				toast.error("Too many requests. Please try again later.")
			}
		},
	},
})

export const { useSession, signOut } = authClient
