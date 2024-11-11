import { HttpApi, OpenApi } from "@effect/platform"
import { BaseApi } from "./routes/main/api"
import { PlaidApi } from "./routes/plaid/api"

export class Api extends HttpApi.empty.add(PlaidApi).add(BaseApi).annotate(OpenApi.Title, "Groups API") {}
