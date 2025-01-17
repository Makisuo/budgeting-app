import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { Config, Data, Effect } from "effect"
import { betterAuthOptions } from "~/lib/auth"

import { drizzle } from "drizzle-orm/postgres-js"

import { schema } from "db"
import { SqlLive } from "./sql"

export class BetterAuthApiError extends Data.TaggedError("BetterAuthApiError")<{
	readonly error: unknown
}> {}

export class BetterAuth extends Effect.Service<BetterAuth>()("BetterAuth", {
	effect: Effect.gen(function* () {
		const databaseUrl = yield* Config.string("DATABASE_URL")

		const db = drizzle(databaseUrl)

		const googleClientId = yield* Config.string("GOOGLE_CLIENT_ID")
		const googleClientSecret = yield* Config.string("GOOGLE_CLIENT_SECRET")

		const auth = betterAuth({
			...betterAuthOptions,
			socialProviders: {
				google: {
					clientId: googleClientId,
					clientSecret: googleClientSecret,
				},
			},
			database: drizzleAdapter(db, {
				provider: "pg",
				schema: schema,
			}),

			emailVerification: {
				sendOnSignUp: true,
				sendVerificationEmail: async ({ url, user }, request) => {
					// TODO: Send email
					// const resend = new Resend(process.env.RESEND_API_KEY!)
					// try {
					// 	await resend.emails.send({
					// 		from: "NoReply <no-reply@hazelapp.dev>",
					// 		to: [user.email],
					// 		subject: "Verify your email address",
					// 		text: url,
					// 	})
					// } catch (err) {
					// 	console.error(err, "Failed to send verification email")
					// }

					return
				},
			},
		})

		const call = <A>(f: (client: typeof auth, signal: AbortSignal) => Promise<A>) =>
			Effect.tryPromise({
				try: (signal) => f(auth, signal),
				catch: (error) => {
					console.error(error)
					return new BetterAuthApiError({ error })
				},
			})

		return {
			call,
		} as const
	}),
	dependencies: [SqlLive],
}) {}
