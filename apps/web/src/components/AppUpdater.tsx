import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UpdateStatus {
  available: boolean;
  version?: string;
}

export function AppUpdater() {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({ available: false });
  const [checking, setChecking] = useState(false);

  const checkForUpdates = async () => {
    try {
      // Check if we're running in a Tauri environment
      if (window.__TAURI__) {
        setChecking(true);
        
        // Import Tauri APIs dynamically to avoid issues in web-only environments
        const { checkUpdate, installUpdate } = await import('@tauri-apps/api/updater');
        
        // Check for updates
        const { shouldUpdate, manifest } = await checkUpdate();
        
        if (shouldUpdate) {
          setUpdateStatus({
            available: true,
            version: manifest?.version,
          });
          
          // Show toast notification about the update
          toast.success(
            `Update available: v${manifest?.version}`,
            {
              description: 'A new version is available. Click to install.',
              action: {
                label: 'Install',
                onClick: async () => {
                  toast.loading('Installing update...');
                  // Install the update
                  await installUpdate();
                },
              },
              duration: 10000, // Show for 10 seconds
            }
          );
        } else {
          // App is up to date
          toast.info('Your app is up to date!');
        }
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      toast.error('Failed to check for updates', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    // Check for updates when the component mounts
    if (window.__TAURI__) {
      // Wait a bit to let the app initialize
      const timer = setTimeout(() => {
        checkForUpdates();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return null; // This component doesn't render anything
}

// Add TypeScript declaration for Tauri global
declare global {
  interface Window {
    __TAURI__?: {
      [key: string]: any;
    };
  }
}