import { Button } from 'react-aria-components';
import { useState } from 'react';
import { toast } from 'sonner';

export function CheckUpdateButton() {
  const [checking, setChecking] = useState(false);

  const checkForUpdates = async () => {
    try {
      // Check if we're running in a Tauri environment
      if (window.__TAURI__) {
        setChecking(true);
        
        // Import Tauri APIs dynamically to avoid issues in web-only environments
        const { checkUpdate, installUpdate } = await import('@tauri-apps/api/updater');
        
        toast.loading('Checking for updates...');
        
        // Check for updates
        const { shouldUpdate, manifest } = await checkUpdate();
        
        if (shouldUpdate) {
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
      } else {
        // Not running in Tauri
        toast.info('Update checking is only available in the desktop app');
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

  // Only show the button in a Tauri environment
  if (typeof window !== 'undefined' && !window.__TAURI__) {
    return null;
  }

  return (
    <Button
      onPress={checkForUpdates}
      isDisabled={checking}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      {checking ? 'Checking...' : 'Check for Updates'}
    </Button>
  );
}