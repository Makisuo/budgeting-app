import { schema } from "db"
import { useAtom } from "jotai"
import { Card, ProgressBar } from "~/components/ui"
import { generalSettingsAtom } from "../../settings"
import { currencyFormatter } from "~/utils/formatters"
import { PrivateValue } from "~/components/private-value"
import { useMemo } from "react"

type BudgetCardProps = {
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
  onEdit?: () => void
  onDelete?: () => void
}

export function BudgetCard({ budget, progress, onEdit, onDelete }: BudgetCardProps) {
  const [settings] = useAtom(generalSettingsAtom)
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
  
  const periodText = useMemo(() => {
    if (budget.isRecurring) {
      return `${budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} (Recurring)`
    } else {
      return `${formatDate(progress.startDate)} - ${formatDate(progress.endDate)}`
    }
  }, [budget, progress])
  
  const statusColor = useMemo(() => {
    if (progress.percentUsed >= 100) {
      return "bg-red-500"
    } else if (progress.percentUsed >= 80) {
      return "bg-yellow-500"
    } else {
      return "bg-green-500"
    }
  }, [progress.percentUsed])
  
  return (
    <Card>
      <Card.Header className="flex flex-row items-start justify-between pb-2">
        <div>
          <Card.Title className="text-xl">{budget.name}</Card.Title>
          <Card.Description>{periodText}</Card.Description>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Delete
            </button>
          )}
        </div>
      </Card.Header>
      <Card.Content>
        <div className="mb-4">
          <ProgressBar
            value={progress.percentUsed}
            max={100}
            className={statusColor}
          />
          <div className="mt-1 flex justify-between text-sm">
            <span>{progress.percentUsed}% used</span>
            <span className="text-muted-foreground">
              {progress.percentUsed >= 100 ? "Over budget" : `${100 - progress.percentUsed}% remaining`}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Budget</p>
            <p className="text-lg font-medium">
              <PrivateValue>
                {currencyFormatter(budget.currency).format(budget.amount)}
              </PrivateValue>
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Spent</p>
            <p className="text-lg font-medium">
              <PrivateValue>
                {currencyFormatter(budget.currency).format(progress.totalSpent)}
              </PrivateValue>
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className={`text-lg font-medium ${progress.remaining < 0 ? "text-red-500" : ""}`}>
              <PrivateValue>
                {currencyFormatter(budget.currency).format(Math.max(0, progress.remaining))}
              </PrivateValue>
            </p>
          </div>
        </div>
      </Card.Content>
    </Card>
  )
}