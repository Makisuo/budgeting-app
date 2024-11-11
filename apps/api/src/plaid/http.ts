import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"
import { MapleApi } from ".."

export const PlaidLive = HttpApiBuilder.group(MapleApi, "plaid", (handlers) =>
	handlers.handle("exchangeToken", (_) => Effect.succeed("WOW")),
)
