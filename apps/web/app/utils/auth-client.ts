import { passkeyClient } from "better-auth/plugins"
import { createAuthClient } from "better-auth/react"

const token = localStorage.getItem("bearer_token")

export const { useSession, signIn, signOut, signUp, ...authClient } = createAuthClient({
	baseURL: "http://localhost:3000",
	plugins: [passkeyClient()],
	fetchOptions: {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	},
})
