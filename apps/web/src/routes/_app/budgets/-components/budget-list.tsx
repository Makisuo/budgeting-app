import { useState } from "react"
import { BudgetCard } from "./budget-card"
import { Button, Dialog } from "~/components/ui"
import { BudgetForm } from "./budget-form"

type BudgetWithProgress = {
  budget: {
    id: string
    name: string
    amount: number
    currency: string
    period: string
    categoryId: string
    startDate: Date
    endDate?: Date
    isRecurring: boolean
  }
  progress: {
    totalSpent: number
    remaining: number
    percentUsed: number
    startDate: Date
    endDate: Date
  }
}

type BudgetListProps = {
  budgets: BudgetWithProgress[]
  onCreateBudget: (data: any) => void
  onUpdateBudget: (id: string, data: any) => void
  onDeleteBudget: (id: string) => void
}

export function BudgetList({ budgets, onCreateBudget, onUpdateBudget, onDeleteBudget }: BudgetListProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetWithProgress | null>(null)
  const [deletingBudgetId, setDeletingBudgetId] = useState<string | null>(null)
  
  const handleCreateSubmit = (data: any) => {
    onCreateBudget(data)
    setIsCreateModalOpen(false)
  }
  
  const handleEditSubmit = (data: any) => {
    if (editingBudget) {
      onUpdateBudget(editingBudget.budget.id, data)
      setEditingBudget(null)
    }
  }
  
  const handleDeleteConfirm = () => {
    if (deletingBudgetId) {
      onDeleteBudget(deletingBudgetId)
      setDeletingBudgetId(null)
    }
  }
  
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Budgets</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>Create Budget</Button>
      </div>
      
      {budgets.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg">
          <h3 className="text-xl font-medium mb-2">No budgets yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first budget to start tracking your spending
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>Create Budget</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budgetItem) => (
            <BudgetCard
              key={budgetItem.budget.id}
              budget={budgetItem.budget}
              progress={budgetItem.progress}
              onEdit={() => setEditingBudget(budgetItem)}
              onDelete={() => setDeletingBudgetId(budgetItem.budget.id)}
            />
          ))}
        </div>
      )}
      
      {/* Create Budget Modal */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <Dialog.Content className="max-w-md">
          <BudgetForm onSubmit={handleCreateSubmit} />
        </Dialog.Content>
      </Dialog>
      
      {/* Edit Budget Modal */}
      <Dialog
        isOpen={!!editingBudget}
        onClose={() => setEditingBudget(null)}
      >
        <Dialog.Content className="max-w-md">
          {editingBudget && (
            <BudgetForm
              initialValues={{
                id: editingBudget.budget.id,
                name: editingBudget.budget.name,
                amount: editingBudget.budget.amount,
                currency: editingBudget.budget.currency,
                period: editingBudget.budget.period,
                categoryId: editingBudget.budget.categoryId,
                startDate: new Date(editingBudget.budget.startDate),
                endDate: editingBudget.budget.endDate ? new Date(editingBudget.budget.endDate) : undefined,
                isRecurring: editingBudget.budget.isRecurring,
              }}
              onSubmit={handleEditSubmit}
              submitLabel="Update Budget"
            />
          )}
        </Dialog.Content>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={!!deletingBudgetId}
        onClose={() => setDeletingBudgetId(null)}
      >
        <Dialog.Content className="max-w-sm">
          <Dialog.Header>
            <Dialog.Title>Delete Budget</Dialog.Title>
            <Dialog.Description>
              Are you sure you want to delete this budget? This action cannot be undone.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Button variant="outline" onClick={() => setDeletingBudgetId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  )
}