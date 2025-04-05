import { schema } from "db"
import { useAtom } from "jotai"
import { useEffect, useState } from "react"
import { Button, Card, ComboBox, DatePicker, Field, Form, TextField } from "~/components/ui"
import { generalSettingsAtom } from "../../settings"
import { useDrizzleLive } from "~/utils/pglite/drizzle-client"
import { BudgetPeriod } from "@maple/api-utils/models/budget"

type BudgetFormProps = {
  onSubmit: (data: {
    name: string
    amount: number
    currency: string
    period: string
    categoryId: string
    startDate: Date
    endDate?: Date
    isRecurring: boolean
  }) => void
  initialValues?: {
    id?: string
    name?: string
    amount?: number
    currency?: string
    period?: string
    categoryId?: string
    startDate?: Date
    endDate?: Date
    isRecurring?: boolean
  }
  submitLabel?: string
}

export function BudgetForm({ onSubmit, initialValues, submitLabel = "Create Budget" }: BudgetFormProps) {
  const [settings] = useAtom(generalSettingsAtom)
  const [name, setName] = useState(initialValues?.name || "")
  const [amount, setAmount] = useState(initialValues?.amount?.toString() || "")
  const [currency, setCurrency] = useState(initialValues?.currency || settings.currency)
  const [period, setPeriod] = useState<string>(initialValues?.period || "monthly")
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId || "")
  const [startDate, setStartDate] = useState<Date | undefined>(initialValues?.startDate || new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(initialValues?.endDate)
  const [isRecurring, setIsRecurring] = useState(initialValues?.isRecurring || false)
  
  const { data: categories } = useDrizzleLive((db) => db.select().from(schema.categories))
  
  const categoryOptions = categories.map((category) => ({
    label: category.name,
    value: category.id,
  }))
  
  const periodOptions = [
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Quarterly", value: "quarterly" },
    { label: "Yearly", value: "yearly" },
  ]
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !amount || !categoryId || !startDate) {
      return
    }
    
    onSubmit({
      name,
      amount: parseFloat(amount),
      currency,
      period: period as BudgetPeriod,
      categoryId,
      startDate,
      endDate,
      isRecurring,
    })
  }
  
  return (
    <Card>
      <Card.Header>
        <Card.Title>{initialValues?.id ? "Edit Budget" : "Create New Budget"}</Card.Title>
        <Card.Description>
          {initialValues?.id 
            ? "Update your budget details" 
            : "Set up a new budget to track your spending"}
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <Form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Budget Name" required>
            <TextField
              placeholder="e.g., Groceries Budget"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Field>
          
          <Field label="Category" required>
            <ComboBox
              options={categoryOptions}
              value={categoryId}
              onChange={setCategoryId}
              placeholder="Select a category"
            />
          </Field>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Amount" required>
              <TextField
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </Field>
            
            <Field label="Currency">
              <TextField
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled
              />
            </Field>
          </div>
          
          <Field label="Budget Period" required>
            <ComboBox
              options={periodOptions}
              value={period}
              onChange={setPeriod}
            />
          </Field>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Start Date" required>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
              />
            </Field>
            
            <Field label="End Date">
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                disabled={isRecurring}
              />
            </Field>
          </div>
          
          <Field>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="isRecurring" className="text-sm font-medium">
                Recurring Budget
              </label>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Recurring budgets automatically reset at the end of each period
            </p>
          </Field>
          
          <div className="flex justify-end">
            <Button type="submit">{submitLabel}</Button>
          </div>
        </Form>
      </Card.Content>
    </Card>
  )
}