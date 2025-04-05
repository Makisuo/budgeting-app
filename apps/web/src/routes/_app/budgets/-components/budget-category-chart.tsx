import { schema } from "db"
import { useMemo } from "react"
import { Card } from "~/components/ui"
import { useDrizzleLive } from "~/utils/pglite/drizzle-client"
import { ResponsivePie } from "@nivo/pie"

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

type BudgetCategoryChartProps = {
  budgets: BudgetWithProgress[]
}

export function BudgetCategoryChart({ budgets }: BudgetCategoryChartProps) {
  const { data: categories } = useDrizzleLive((db) => db.select().from(schema.categories))
  
  const chartData = useMemo(() => {
    const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]))
    
    const categorySpending = budgets.reduce((acc, { budget, progress }) => {
      const categoryName = categoryMap.get(budget.categoryId) || "Unknown"
      
      if (!acc[categoryName]) {
        acc[categoryName] = {
          id: categoryName,
          label: categoryName,
          value: 0,
        }
      }
      
      acc[categoryName].value += progress.totalSpent
      
      return acc
    }, {} as Record<string, { id: string; label: string; value: number }>)
    
    return Object.values(categorySpending)
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [budgets, categories])
  
  const getColor = (category: string) => {
    const colors = [
      "hsl(209, 70%, 50%)",
      "hsl(172, 70%, 50%)",
      "hsl(322, 70%, 50%)",
      "hsl(26, 70%, 50%)",
      "hsl(271, 70%, 50%)",
      "hsl(120, 70%, 50%)",
      "hsl(0, 70%, 50%)",
      "hsl(54, 70%, 50%)",
      "hsl(190, 70%, 50%)",
      "hsl(340, 70%, 50%)",
    ]
    
    const index = category.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    
    return colors[index]
  }
  
  const coloredChartData = chartData.map(item => ({
    ...item,
    color: getColor(item.id),
  }))
  
  return (
    <Card>
      <Card.Header>
        <Card.Title>Spending by Category</Card.Title>
        <Card.Description>
          How your spending is distributed across different categories
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <div className="h-[400px] w-full">
          {coloredChartData.length > 0 ? (
            <ResponsivePie
              data={coloredChartData}
              margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              borderWidth={1}
              borderColor={{
                from: "color",
                modifiers: [["darker", 0.2]],
              }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="var(--color-fg)"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: "color" }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{
                from: "color",
                modifiers: [["darker", 2]],
              }}
              legends={[
                {
                  anchor: "bottom",
                  direction: "row",
                  justify: false,
                  translateX: 0,
                  translateY: 56,
                  itemsSpacing: 0,
                  itemWidth: 100,
                  itemHeight: 18,
                  itemTextColor: "var(--color-fg)",
                  itemDirection: "left-to-right",
                  itemOpacity: 1,
                  symbolSize: 18,
                  symbolShape: "circle",
                  effects: [
                    {
                      on: "hover",
                      style: {
                        itemTextColor: "var(--color-muted-fg)",
                      },
                    },
                  ],
                },
              ]}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No spending data available</p>
            </div>
          )}
        </div>
      </Card.Content>
    </Card>
  )
}