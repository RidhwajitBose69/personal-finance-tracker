import BudgetManager from '../components/BudgetManager'

interface BudgetsProps {
  refreshTrigger: number
}

function Budgets({
  refreshTrigger,
}: BudgetsProps) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Budgets</h2>
          <p>
            Set spending limits and monitor your progress.
          </p>
        </div>
      </div>

      <section className="section-card">
        <BudgetManager
          refreshTrigger={refreshTrigger}
        />
      </section>
    </div>
  )
}

export default Budgets