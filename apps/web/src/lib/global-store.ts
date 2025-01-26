import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

export const privacyModeAtom = atomWithStorage("privacyMode", false)

export const usePrivacyMode = () => {
	return useAtom(privacyModeAtom)
}
