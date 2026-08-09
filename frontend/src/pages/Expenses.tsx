import ExpenseForm from '../components/ExpenseForm'
import ExpenseList from '../components/ExpenseList'

import type { Expense } from '../services/api'

interface ExpensesProps {
  expenses: Expense[]
  editingExpense: Expense | null
  onEditExpense: (expense: Expense) => void
  onCancelEdit: () => void
  onExpenseChanged: () => void
}

function Expenses({
  expenses,
  editingExpense,
  onEditExpense,
  onCancelEdit,
  onExpenseChanged,
}: ExpensesProps) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Expenses</h2>
          <p>
            Add, edit, search and manage your expenses.
          </p>
        </div>
      </div>

      <section className="section-card">
        <div className="card-header">
          <div>
            <h3>
              {editingExpense
                ? 'Edit Expense'
                : 'Add Expense'}
            </h3>

            <p>
              {editingExpense
                ? 'Update the selected transaction.'
                : 'Record a new expense.'}
            </p>
          </div>
        </div>

        <ExpenseForm
          editingExpense={editingExpense}
          onCancelEdit={onCancelEdit}
          onExpenseChanged={onExpenseChanged}
        />
      </section>

      <section className="section-card">
        <div className="card-header">
          <div>
            <h3>Expense History</h3>
            <p>
              {expenses.length} transaction
              {expenses.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        <ExpenseList
          expenses={expenses}
          onEditExpense={onEditExpense}
          onExpenseChanged={onExpenseChanged}
        />
      </section>
    </div>
  )
}

export default Expenses