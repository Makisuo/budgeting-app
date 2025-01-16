import { appConfig } from "@/lib/config"
import Link from "next/link"

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="w-full max-w-md p-4">
				<Link href="/" className="mb-2 inline-block font-mono text-muted-fg text-xs uppercase hover:text-fg">
					{appConfig.name}
				</Link>
				{children}
			</div>
		</div>
	)
}
