import { usePrivacyMode } from "~/lib/global-store"

export const PrivateValue = ({ children }: { children: React.ReactNode }) => {
	const [isPrivate] = usePrivacyMode()
	return <span className={isPrivate ? "blur-[3px] filter" : ""}>{children}</span>
}
