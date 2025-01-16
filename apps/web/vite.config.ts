import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

import tailwindcss from "@tailwindcss/vite"

// https://vitejs.dev/config/
export default defineConfig({
	ssr: {
		noExternal: ["@electric-sql/pglite-react", "react-scan"],
	},
	optimizeDeps: {
		exclude: ["@electric-sql/pglite", "react-scan"],
	},
	worker: {
		format: "es",
	},
	plugins: [
		tsconfigPaths(),
		TanStackRouterVite({
			routeToken: "layout",
		}),
		react(),
		tailwindcss(),
	],
})
