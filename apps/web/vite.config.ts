import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

import { cloudflare } from "@cloudflare/vite-plugin"

import tailwindcss from "@tailwindcss/vite"

const host = process.env.TAURI_DEV_HOST
const isTauri = process.env.TAURI_PLATFORM !== undefined

export default defineConfig({
	optimizeDeps: {
		exclude: ["@electric-sql/pglite", "react-scan"],
	},
	worker: {
		format: "es",
	},
	plugins: [
		tsconfigPaths(),
		// Only load Cloudflare plugin when not in Tauri environment
		...(!isTauri ? [cloudflare()] : []),
		TanStackRouterVite({
			routeToken: "layout",
		}),
		react(),
		tailwindcss(),
	],
	clearScreen: false,
	server: {
		port: 3000,
		strictPort: true,
		// host: host || false,
		// hmr: host
		// 	? {
		// 			protocol: "ws",
		// 			host,
		// 			port: 1421,
		// 		}
		// 	: undefined,
		// watch: {
		// 	// 3. tell vite to ignore watching `src-tauri`
		// 	ignored: ["**/src-tauri/**"],
		// },
	},
})
