import DashboardStats from '../components/DashboardStats'
import CategoryChart from '../components/CategoryChart'
import MonthlyChart from '../components/MonthlyChart'
import AIInsights from '../components/AIInsights'
import ExpenseList from '../components/ExpenseList'

import type { Expense } from '../services/api'

interface DashboardProps {
  expenses: Expense[]
  onExpenseChanged: () => void
  onEditExpense: (expense: Expense) => void
}

function Dashboard({
  expenses,
  onExpenseChanged,
  onEditExpense,
}: DashboardProps) {
  const recentExpenses = expenses.slice(0, 5)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>
            Get a quick overview of your financial activity.
          </p>
        </div>
      </div>

      <section className="dashboard-section">
        <DashboardStats expenses={expenses} />
      </section>

      <section className="charts-section">
        <div className="chart-card">
          <div className="card-header">
            <h3>Spending by Category</h3>
          </div>

          <CategoryChart expenses={expenses} />
        </div>

        <div className="chart-card">
          <div className="card-header">
            <h3>Monthly Spending</h3>
          </div>

          <MonthlyChart expenses={expenses} />
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="section-card">
          <div className="card-header">
            <div>
              <h3>Recent Transactions</h3>
              <p>Your latest expenses</p>
            </div>
          </div>

          <ExpenseList
            expenses={recentExpenses}
            onEditExpense={onEditExpense}
            onExpenseChanged={onExpenseChanged}
          />
        </div>

        <div className="section-card">
          <AIInsights expenses={expenses} />
        </div>
      </section>
    </div>
  )
}

export default Dashboard