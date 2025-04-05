import { useState } from "react"
import { checkUpdate, installUpdate } from "@tauri-apps/api/updater"
import { relaunch } from "@tauri-apps/api/process"
import { toast } from "sonner"
import { Button } from "justd"

/**
 * Button component for manually checking for updates
 * Uses Tauri's updater API to check for updates from GitHub releases
 */
export function CheckUpdateButton() {
  const [isChecking, setIsChecking] = useState(false)

  // Only show in Tauri environment
  if (typeof window.__TAURI__ === "undefined") {
    return null
  }

  const handleCheckUpdate = async () => {
    setIsChecking(true)
    
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
      } else {
        toast.info("You're using the latest version")
      }
    } catch (error) {
      console.error("Error checking for updates:", error)
      toast.error("Failed to check for updates", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <Button 
      onClick={handleCheckUpdate}
      disabled={isChecking}
      variant="outline"
    >
      {isChecking ? "Checking..." : "Check for Updates"}
    </Button>
  )
}