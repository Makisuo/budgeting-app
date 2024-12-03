import { createClerkHandler } from "@clerk/tanstack-start/server"
import { getRouterManifest } from "@tanstack/start/router-manifest"
import { createStartHandler, defaultStreamHandler } from "@tanstack/start/server"
import { createRouter } from "./router"

export default createClerkHandler(
	// @ts-expect-error
	createStartHandler({
		createRouter,
		getRouterManifest,
	}),
)(defaultStreamHandler)
