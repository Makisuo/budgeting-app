import { createFileRoute } from "@tanstack/react-router"
import { BudgetStats } from "./-components/budget-stats"
import { BudgetList } from "./-components/budget-list"
import { BudgetCategoryChart } from "./-components/budget-category-chart"
import { useEffect, useState } from "react"
import { useAuth } from "~/lib/auth/use-auth"
import { useAtom } from "jotai"
import { generalSettingsAtom } from "../settings"

export const Route = createFileRoute("/_app/budgets/")({
	component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth()
  const [settings] = useAtom(generalSettingsAtom)
  const [budgets, setBudgets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setIsLoading(true)
        
        const response = await fetch('/api/v1/budgets/progress', {
          headers: {
            'Authorization': `Bearer ${user?.tenantId}`,
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch budgets')
        }
        
        const data = await response.json()
        setBudgets(data)
      } catch (err) {
        console.error('Error fetching budgets:', err)
        setError('Failed to load budgets. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (user?.tenantId) {
      fetchBudgets()
    }
  }, [user?.tenantId])
  
  const handleCreateBudget = async (budgetData) => {
    try {
      const response = await fetch('/api/v1/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.tenantId}`,
        },
        body: JSON.stringify({
          ...budgetData,
          currency: settings.currency,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create budget')
      }
      
      // Refresh budgets
      const updatedResponse = await fetch('/api/v1/budgets/progress', {
        headers: {
          'Authorization': `Bearer ${user?.tenantId}`,
        },
      })
      
      if (!updatedResponse.ok) {
        throw new Error('Failed to fetch updated budgets')
      }
      
      const updatedData = await updatedResponse.json()
      setBudgets(updatedData)
    } catch (err) {
      console.error('Error creating budget:', err)
      setError('Failed to create budget. Please try again.')
    }
  }
  
  const handleUpdateBudget = async (id, budgetData) => {
    try {
      const response = await fetch(`/api/v1/budgets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.tenantId}`,
        },
        body: JSON.stringify(budgetData),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update budget')
      }
      
      // Refresh budgets
      const updatedResponse = await fetch('/api/v1/budgets/progress', {
        headers: {
          'Authorization': `Bearer ${user?.tenantId}`,
        },
      })
      
      if (!updatedResponse.ok) {
        throw new Error('Failed to fetch updated budgets')
      }
      
      const updatedData = await updatedResponse.json()
      setBudgets(updatedData)
    } catch (err) {
      console.error('Error updating budget:', err)
      setError('Failed to update budget. Please try again.')
    }
  }
  
  const handleDeleteBudget = async (id) => {
    try {
      const response = await fetch(`/api/v1/budgets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.tenantId}`,
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete budget')
      }
      
      // Update local state
      setBudgets(budgets.filter(budget => budget.budget.id !== id))
    } catch (err) {
      console.error('Error deleting budget:', err)
      setError('Failed to delete budget. Please try again.')
    }
  }
  
	return (
		<div className="space-y-8">
			<BudgetStats />
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <BudgetCategoryChart budgets={budgets} />
        
        <div className="lg:col-span-2">
          <BudgetList 
            budgets={budgets}
            onCreateBudget={handleCreateBudget}
            onUpdateBudget={handleUpdateBudget}
            onDeleteBudget={handleDeleteBudget}
          />
        </div>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-700">
          <p>{error}</p>
        </div>
      )}
		</div>
	)
}
