import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { CreateBudget, UpdateBudget } from "@maple/api-utils/models/budget"
import * as api from "./api"
import { withAuth } from "../../authorization"

const app = new Hono()

// Get all budgets
app.get("/", withAuth(), async (c) => {
  const tenantId = c.get("tenantId")
  const budgets = await api.getBudgets(tenantId)
  return c.json(budgets)
})

// Get all budgets with progress
app.get("/progress", withAuth(), async (c) => {
  const tenantId = c.get("tenantId")
  const budgetsProgress = await api.getAllBudgetsProgress(tenantId)
  return c.json(budgetsProgress)
})

// Get a single budget
app.get("/:id", withAuth(), async (c) => {
  const id = c.req.param("id")
  const budget = await api.getBudget(id)
  
  if (!budget) {
    return c.json({ error: "Budget not found" }, 404)
  }
  
  return c.json(budget)
})

// Get a single budget with progress
app.get("/:id/progress", withAuth(), async (c) => {
  const id = c.req.param("id")
  const tenantId = c.get("tenantId")
  
  try {
    const budgetProgress = await api.getBudgetProgress(id, tenantId)
    return c.json(budgetProgress)
  } catch (error) {
    return c.json({ error: "Budget not found" }, 404)
  }
})

// Create a new budget
app.post(
  "/",
  withAuth(),
  zValidator("json", CreateBudget),
  async (c) => {
    const data = c.req.valid("json")
    const tenantId = c.get("tenantId")
    
    const budget = await api.createBudget({
      ...data,
      tenantId,
    })
    
    return c.json(budget, 201)
  }
)

// Update a budget
app.put(
  "/:id",
  withAuth(),
  zValidator("json", UpdateBudget),
  async (c) => {
    const id = c.req.param("id")
    const data = c.req.valid("json")
    
    const budget = await api.updateBudget(id, data)
    
    if (!budget) {
      return c.json({ error: "Budget not found" }, 404)
    }
    
    return c.json(budget)
  }
)

// Delete a budget
app.delete("/:id", withAuth(), async (c) => {
  const id = c.req.param("id")
  
  try {
    await api.deleteBudget(id)
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: "Failed to delete budget" }, 500)
  }
})

export default app