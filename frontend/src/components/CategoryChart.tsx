import { useMemo } from 'react'
import { type Expense } from '../services/api'

interface CategoryChartProps {
  expenses: Expense[]
}

function CategoryChart({
  expenses,
}: CategoryChartProps) {
  const data = useMemo(() => {
    const totals: Record<string, number> = {}

    expenses.forEach((expense) => {
      totals[expense.category] =
        (totals[expense.category] || 0) +
        Number(expense.amount)
    })

    return Object.entries(totals)
      .map(([category, total]) => ({
        category,
        total,
      }))
      .sort((a, b) => b.total - a.total)
  }, [expenses])

  const maximum =
    data.length > 0
      ? data[0].total
      : 0

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Spending by Category</h2>

          <p>
            Where most of your money goes.
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="empty-state">
          No category data yet.
        </div>
      ) : (
        <div className="category-chart">
          {data.map((item) => {
            const percentage =
              maximum > 0
                ? (item.total / maximum) *
                  100
                : 0

            return (
              <div
                className="category-row"
                key={item.category}
              >
                <div className="category-row-header">
                  <span>
                    {item.category
                      .charAt(0)
                      .toUpperCase() +
                      item.category.slice(1)}
                  </span>

                  <strong>
                    ₹
                    {item.total.toLocaleString(
                      'en-IN',
                      {
                        minimumFractionDigits: 2,
                      },
                    )}
                  </strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default CategoryChart