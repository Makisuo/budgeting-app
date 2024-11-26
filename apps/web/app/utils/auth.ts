import { betterAuth } from "better-auth"
import { bearer, passkey } from "better-auth/plugins"

import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "./db"

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		github: {
			clientId: process?.env?.GITHUB_CLIENT_ID!,
			clientSecret: process?.env?.GITHUB_CLIENT_SECRET!,
		},
	},
	account: {
		accountLinking: {
			enabled: true,
		},
	},

	plugins: [passkey(), bearer()],
})
