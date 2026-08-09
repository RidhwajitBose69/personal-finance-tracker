import { type Expense } from '../services/api'

interface DashboardStatsProps {
  expenses: Expense[]
}

function DashboardStats({
  expenses,
}: DashboardStatsProps) {
  const total = expenses.reduce(
    (sum, expense) =>
      sum + Number(expense.amount),
    0,
  )

  const currentMonth = new Date()
    .getMonth()

  const currentYear = new Date()
    .getFullYear()

  const monthlyTotal = expenses
    .filter((expense) => {
      const date = new Date(expense.date)

      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      )
    })
    .reduce(
      (sum, expense) =>
        sum + Number(expense.amount),
      0,
    )

  const average =
    expenses.length > 0
      ? total / expenses.length
      : 0

  const largest =
    expenses.length > 0
      ? Math.max(
          ...expenses.map(
            (expense) =>
              Number(expense.amount),
          ),
        )
      : 0

  return (
    <section className="stats-grid">
      <div className="stat-card">
        <span className="stat-label">
          Total Spending
        </span>

        <strong className="stat-value">
          ₹
          {total.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
          })}
        </strong>

        <span className="stat-description">
          All recorded expenses
        </span>
      </div>

      <div className="stat-card">
        <span className="stat-label">
          This Month
        </span>

        <strong className="stat-value">
          ₹
          {monthlyTotal.toLocaleString(
            'en-IN',
            {
              minimumFractionDigits: 2,
            },
          )}
        </strong>

        <span className="stat-description">
          Current month spending
        </span>
      </div>

      <div className="stat-card">
        <span className="stat-label">
          Average Expense
        </span>

        <strong className="stat-value">
          ₹
          {average.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
          })}
        </strong>

        <span className="stat-description">
          Per transaction
        </span>
      </div>

      <div className="stat-card">
        <span className="stat-label">
          Largest Expense
        </span>

        <strong className="stat-value">
          ₹
          {largest.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
          })}
        </strong>

        <span className="stat-description">
          Highest single transaction
        </span>
      </div>
    </section>
  )
}

export default DashboardStats