import { HttpApi, OpenApi } from "@effect/platform"
import { AdminApi } from "./routes/admin/api"
import { GoCardlessApi } from "./routes/go-cardless/api"
import { RootApi } from "./routes/root/api"

export class Api extends HttpApi.empty
	.add(RootApi)
	.add(GoCardlessApi)
	.add(AdminApi)
	.annotate(OpenApi.Title, "Hazel API") {}
