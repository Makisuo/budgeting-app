import { Link, type NavigateFn, createFileRoute, useRouter } from "@tanstack/react-router"
import { IconBrandGithub, IconBrandGoogle, IconMail } from "justd-icons"
import { useEffect } from "react"
import { Card, TextField } from "~/components/ui"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { signIn, useSession } from "~/utils/auth-client"

export const Route = createFileRoute("/auth/signin")({
	component: RouteComponent,
})

const signInOauth = async (provider: "github" | "google", navigate: NavigateFn) => {
	const res = await signIn.social({ provider: provider, callbackURL: "/" })

	if (res.error) {
		throw new Error(res.error.message)
	}

	if (!res.data) {
		throw new Error("No data returned from signIn.social")
	}

	throw navigate({ to: res.data.url })
}

function RouteComponent() {
	const { navigate } = useRouter()

	return (
		<div className="container mx-auto flex size-full min-h-screen items-center justify-center">
			<Card className="w-[350px]">
				<Card.Header>
					<Card.Title className="text-center text-2xl">Sign In</Card.Title>
					<Card.Description>Choose your preferred login method</Card.Description>
				</Card.Header>
				<Card.Content className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<Button onPress={() => signInOauth("google", navigate)}>
							<IconBrandGoogle />
							Google
						</Button>
						<Button onPress={() => signInOauth("github", navigate)}>
							<IconBrandGithub />
							Github
						</Button>
					</div>
					<Separator />
					<TextField name="email" label="Email" placeholder="Email" type="email" autoComplete="email" />
					<TextField
						name="password"
						label="Password"
						placeholder="Password"
						type="password"
						autoComplete="current-password"
					/>
					<Button className="w-full">
						<IconMail />
						Login with Email
					</Button>
				</Card.Content>
				<Card.Footer>
					<p className="w-full text-center text-muted-fg text-sm">
						Don't have an account?{" "}
						<Link to="/auth/register" className="text-primary hover:underline">
							Register here
						</Link>
					</p>
				</Card.Footer>
			</Card>
		</div>
	)
}
