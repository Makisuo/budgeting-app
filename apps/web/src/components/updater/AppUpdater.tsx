import { useEffect } from "react"
import { checkUpdate, installUpdate } from "@tauri-apps/api/updater"
import { relaunch } from "@tauri-apps/api/process"
import { toast } from "sonner"

/**
 * Component that automatically checks for updates when the app starts
 * Uses Tauri's updater API to check for updates from GitHub releases
 */
export function AppUpdater() {
  useEffect(() => {
    // Only run in Tauri environment
    if (typeof window.__TAURI__ === "undefined") return

    const checkForUpdates = async () => {
      try {
        const { shouldUpdate, manifest } = await checkUpdate()
        
        if (shouldUpdate) {
          toast.success(
            `Update available: v${manifest?.version}`,
            {
              description: "Installing update...",
              duration: 5000,
            }
          )
          
          // Install the update
          await installUpdate()
          
          // Show toast with restart button
          toast.success(
            "Update installed!",
            {
              description: "Restart to apply updates",
              action: {
                label: "Restart Now",
                onClick: async () => {
                  await relaunch()
                }
              },
              duration: Infinity,
            }
          )
        }
      } catch (error) {
        console.error("Error checking for updates:", error)
      }
    }

    // Check for updates when the component mounts
    checkForUpdates()
  }, [])

  // This component doesn't render anything
  return null
}