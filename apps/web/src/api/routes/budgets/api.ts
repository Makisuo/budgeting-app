import { z } from "zod"
import { BudgetRepository } from "../../repositories/budget-repo"
import { CreateBudget, UpdateBudget } from "@maple/api-utils/models/budget"
import { schema } from "db"
import { and, eq, isNull, sql } from "drizzle-orm"
import { db } from "../../services/sql"

const budgetRepo = new BudgetRepository()

export async function getBudgets(tenantId: string) {
  return budgetRepo.findByTenantId(tenantId)
}

export async function getBudget(id: string) {
  return budgetRepo.findById(id)
}

export async function createBudget(data: z.infer<typeof CreateBudget>) {
  return budgetRepo.create(data)
}

export async function updateBudget(id: string, data: z.infer<typeof UpdateBudget>) {
  return budgetRepo.update(id, data)
}

export async function deleteBudget(id: string) {
  return budgetRepo.delete(id)
}

export async function getBudgetProgress(budgetId: string, tenantId: string) {
  const budget = await budgetRepo.findById(budgetId)
  
  if (!budget) {
    throw new Error("Budget not found")
  }
  
  // Get the start and end dates for the budget period
  let startDate = budget.startDate
  let endDate = budget.endDate || new Date()
  
  // For recurring budgets, adjust the date range based on the period
  if (budget.isRecurring) {
    const now = new Date()
    
    switch (budget.period) {
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
        break
      case "weekly":
        const day = now.getDay()
        startDate = new Date(now.setDate(now.getDate() - day))
        endDate = new Date(now.setDate(now.getDate() + 6))
        break
      case "quarterly":
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0)
        break
    }
  }
  
  // Get transactions for the category within the date range
  const transactions = await db
    .select({
      totalSpent: sql<number>`SUM(CASE WHEN ${schema.transactions.amount} < 0 THEN ABS(${schema.transactions.amount}) ELSE 0 END)`.as("totalSpent"),
    })
    .from(schema.transactions)
    .where(
      and(
        eq(schema.transactions.categoryId, budget.categoryId),
        eq(schema.transactions.tenantId, tenantId),
        sql`${schema.transactions.date} >= ${startDate}`,
        sql`${schema.transactions.date} <= ${endDate}`,
        isNull(schema.transactions.directTransfer)
      )
    )
  
  const totalSpent = transactions[0]?.totalSpent || 0
  const remaining = budget.amount - totalSpent
  const percentUsed = Math.min(100, Math.round((totalSpent / budget.amount) * 100))
  
  return {
    budget,
    progress: {
      totalSpent,
      remaining,
      percentUsed,
      startDate,
      endDate,
    }
  }
}

export async function getAllBudgetsProgress(tenantId: string) {
  const budgets = await budgetRepo.findByTenantId(tenantId)
  
  const results = await Promise.all(
    budgets.map(async (budget) => {
      try {
        return await getBudgetProgress(budget.id, tenantId)
      } catch (error) {
        console.error(`Error getting progress for budget ${budget.id}:`, error)
        return {
          budget,
          progress: {
            totalSpent: 0,
            remaining: budget.amount,
            percentUsed: 0,
            startDate: budget.startDate,
            endDate: budget.endDate || new Date(),
          }
        }
      }
    })
  )
  
  return results
}