import { defineConfig } from "@tanstack/start/config"
import tsConfigPaths from "vite-tsconfig-paths"

export default defineConfig({
	vite: {
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
			tsConfigPaths({
				projects: ["./tsconfig.json"],
			}),
		],
	},
	react: {
		babel: {
			// plugins: [
			// 	[
			// 		"babel-plugin-react-compiler",
			// 		{
			// 			target: 18,
			// 		},
			// 	],
			// ],
		},
	},
	server: {
		preset: "vercel",
	},
})
