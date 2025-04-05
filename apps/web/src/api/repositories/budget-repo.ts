import { schema } from "db"
import { and, eq, isNull } from "drizzle-orm"
import { nanoid } from "nanoid"
import { z } from "zod"

import { Budget, CreateBudget, UpdateBudget } from "@maple/api-utils/models/budget"
import { ModelRepository } from "@maple/api-utils/services/model-repository"

export class BudgetRepository extends ModelRepository<typeof schema.budgets> {
  constructor() {
    super(schema.budgets)
  }

  async create(data: z.infer<typeof CreateBudget>) {
    const id = data.id ?? `budget_${nanoid()}`
    const now = new Date()

    const budget = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    }

    await this.db.insert(this.table).values(budget)

    return budget
  }

  async update(id: string, data: z.infer<typeof UpdateBudget>) {
    const now = new Date()

    const budget = {
      ...data,
      updatedAt: now,
    }

    await this.db
      .update(this.table)
      .set(budget)
      .where(and(eq(this.table.id, id), isNull(this.table.deletedAt)))

    return this.findById(id)
  }

  async delete(id: string) {
    const now = new Date()

    await this.db
      .update(this.table)
      .set({
        deletedAt: now,
        updatedAt: now,
      })
      .where(and(eq(this.table.id, id), isNull(this.table.deletedAt)))

    return true
  }

  async findById(id: string) {
    const result = await this.db
      .select()
      .from(this.table)
      .where(and(eq(this.table.id, id), isNull(this.table.deletedAt)))
      .limit(1)

    return result[0]
  }

  async findByTenantId(tenantId: string) {
    const result = await this.db
      .select()
      .from(this.table)
      .where(and(eq(this.table.tenantId, tenantId), isNull(this.table.deletedAt)))

    return result
  }

  async findByCategoryId(categoryId: string, tenantId: string) {
    const result = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(this.table.categoryId, categoryId),
          eq(this.table.tenantId, tenantId),
          isNull(this.table.deletedAt)
        )
      )

    return result
  }
}