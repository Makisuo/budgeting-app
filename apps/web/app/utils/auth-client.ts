import { passkeyClient } from "better-auth/plugins"
import { createAuthClient } from "better-auth/react"

export const { useSession, signIn, signOut, signUp, ...authClient } = createAuthClient({
	baseURL: "http://localhost:3000",
	plugins: [passkeyClient()],
})
