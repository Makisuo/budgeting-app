import { z } from "zod"
import { createId } from "./utils"

export const Id = createId("budget")

export const BudgetPeriod = z.enum(["monthly", "yearly", "weekly", "quarterly"])
export type BudgetPeriod = z.infer<typeof BudgetPeriod>

export const Budget = z.object({
  id: Id,
  name: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3),
  period: BudgetPeriod,
  categoryId: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
  isRecurring: z.boolean().default(false),
  tenantId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional(),
})

export type Budget = z.infer<typeof Budget>

export const CreateBudget = Budget.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).extend({
  id: Id.optional(),
})

export type CreateBudget = z.infer<typeof CreateBudget>

export const UpdateBudget = CreateBudget.partial()
export type UpdateBudget = z.infer<typeof UpdateBudget>