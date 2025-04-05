import { type BetterAuthOptions, betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { jwt, oneTap, openAPI } from "better-auth/plugins"
import { passkey } from "better-auth/plugins/passkey"

import { PostgresJsDatabase } from "drizzle-orm/postgres-js"

import { env } from "cloudflare:workers"

export const betterAuthOptions = {
	baseURL: env.VITE_BASE_URL,
	appName: "Maple Budget",
	trustedOrigins: ["http://localhost:3000", "https://app.maple.dev"],
	basePath: "/api/better-auth",
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
	},
	emailVerification: {
		autoSignInAfterVerification: true,
	},
	socialProviders: {},
	advanced: {
		crossSubDomainCookies: {
			enabled: true,
		},
	},

	plugins: [
		openAPI({ path: "/docs" }),
		passkey({
			rpID: "electric-auth.com",
			rpName: "Electric Auth",
		}),
		jwt({
			// jwks: {
			// 	keyPairConfig: {
			// 		alg: "EdDSA",
			// 		crv: "Ed25519",
			// 	},
			// },
		}),
		// oAuthProxy(),
		oneTap(),
	],
} satisfies BetterAuthOptions

export const auth = betterAuth({
	...betterAuthOptions,
	database: drizzleAdapter(PostgresJsDatabase, {
		provider: "pg",
	}),
})
