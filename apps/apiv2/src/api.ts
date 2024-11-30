import { HttpApi, OpenApi } from "@effect/platform"
import { GoCardlessApi } from "./routes/go-cardless/api"
import { RootApi } from "./routes/root/api"

export class Api extends HttpApi.empty.add(RootApi).add(GoCardlessApi).annotate(OpenApi.Title, "Hazel API") {}
