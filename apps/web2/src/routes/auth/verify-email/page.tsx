import { Suspense } from "react"
import { Client } from "./client"

export const metadata = {
	title: "Verify Email",
	description:
		"Before continuing, could you verify your email address by clicking on the link we just emailed to you? If you didn't receive the email, we will gladly send you another.",
}

export default function Page() {
	return (
		<Suspense>
			<Client />
		</Suspense>
	)
}
