import { Context, Schema } from "effect"

export const TenantId = Schema.String.pipe(Schema.brand("TenantId"))
export type TenantId = typeof TenantId.Type

export class User extends Schema.Class<User>("User")({ tenantId: TenantId }) {}
export class CurrentUser extends Context.Tag("CurrentUser")<CurrentUser, User>() {}
