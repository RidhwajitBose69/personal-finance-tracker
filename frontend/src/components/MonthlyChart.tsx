import { type Expense } from '../services/api'

interface MonthlyChartProps {
  expenses: Expense[]
}

function MonthlyChart({
  expenses,
}: MonthlyChartProps) {
  const monthlyData: Record<
    string,
    number
  > = {}

  expenses.forEach((expense) => {
    const date = new Date(expense.date)

    const key = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, '0')}`

    monthlyData[key] =
      (monthlyData[key] || 0) +
      Number(expense.amount)
  })

  const data = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)

  const maximum =
    data.length > 0
      ? Math.max(...data.map(([, value]) => value))
      : 0

  function formatMonth(key: string) {
    const [year, month] = key
      .split('-')
      .map(Number)

    return new Date(
      year,
      month - 1,
      1,
    ).toLocaleString('en-IN', {
      month: 'short',
      year: '2-digit',
    })
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Monthly Spending</h2>

          <p>
            Your spending trend over time.
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="empty-state">
          No monthly data yet.
        </div>
      ) : (
        <div className="monthly-chart">
          {data.map(([month, total]) => {
            const height =
              maximum > 0
                ? (total / maximum) * 100
                : 0

            return (
              <div
                className="chart-column"
                key={month}
              >
                <span className="chart-value">
                  ₹
                  {total.toLocaleString(
                    'en-IN',
                    {
                      maximumFractionDigits: 0,
                    },
                  )}
                </span>

                <div className="bar-area">
                  <div
                    className="chart-bar"
                    style={{
                      height: `${height}%`,
                    }}
                  />
                </div>

                <span className="chart-label">
                  {formatMonth(month)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default MonthlyChart