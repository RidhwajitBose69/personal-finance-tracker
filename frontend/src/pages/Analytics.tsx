import CategoryChart from '../components/CategoryChart'
import MonthlyChart from '../components/MonthlyChart'
import DashboardStats from '../components/DashboardStats'

import type { Expense } from '../services/api'

interface AnalyticsProps {
  expenses: Expense[]
}

function Analytics({
  expenses,
}: AnalyticsProps) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Analytics</h2>
          <p>
            Understand where your money is going.
          </p>
        </div>
      </div>

      <section className="dashboard-section">
        <DashboardStats expenses={expenses} />
      </section>

      <section className="charts-section">
        <div className="chart-card">
          <div className="card-header">
            <div>
              <h3>Category Breakdown</h3>
              <p>
                How your spending is distributed.
              </p>
            </div>
          </div>

          <CategoryChart expenses={expenses} />
        </div>

        <div className="chart-card">
          <div className="card-header">
            <div>
              <h3>Monthly Spending</h3>
              <p>
                Track spending trends over time.
              </p>
            </div>
          </div>

          <MonthlyChart expenses={expenses} />
        </div>
      </section>
    </div>
  )
}

export default Analytics