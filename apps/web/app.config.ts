import { defineConfig } from "@tanstack/start/config"
import tsConfigPaths from "vite-tsconfig-paths"

export default defineConfig({
	vite: {
		ssr: {
			noExternal: ["@electric-sql/pglite-react"],
		},
		optimizeDeps: {
			exclude: ["@electric-sql/pglite"],
		},
		worker: {
			format: "es",
		},
		plugins: [
			tsConfigPaths({
				projects: ["./tsconfig.json"],
			}),
		],
	},
	server: {
		preset: "vercel",
	},
})
