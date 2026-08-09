import {
  useEffect,
  useState,
} from 'react'

import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetSpending,
} from '../services/api'

import type {
  Budget,
  BudgetSpending,
} from '../services/api'

interface BudgetManagerProps {
  refreshTrigger: number
}

const categories = [
  'food',
  'transport',
  'shopping',
  'entertainment',
  'bills',
  'health',
  'education',
  'travel',
  'other',
]

function BudgetManager({
  refreshTrigger,
}: BudgetManagerProps) {

  const [budgets, setBudgets] =
    useState<Budget[]>([])

  const [spending, setSpending] =
    useState<BudgetSpending[]>([])

  const [loading, setLoading] =
    useState(true)

  const [category, setCategory] =
    useState('food')

  const [amount, setAmount] =
    useState('')

  const [month, setMonth] =
    useState(
      new Date().getMonth() + 1,
    )

  const [year, setYear] =
    useState(
      new Date().getFullYear(),
    )

  const [editingId, setEditingId] =
    useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [refreshTrigger, month, year])

  async function loadData() {

    try {
      setLoading(true)

      const [
        budgetData,
        spendingData,
      ] = await Promise.all([
        getBudgets(),
        getBudgetSpending(
          month,
          year,
        ),
      ])

      setBudgets(budgetData)

      setSpending(spendingData)

    } catch (error) {

      console.error(
        'Failed to load budgets:',
        error,
      )

    } finally {

      setLoading(false)

    }
  }

  async function handleSubmit(
    event: React.FormEvent,
  ) {

    event.preventDefault()

    if (
      !amount ||
      Number(amount) <= 0
    ) {
      alert(
        'Please enter a valid budget amount.',
      )

      return
    }

    try {

      if (editingId) {

        await updateBudget(
          editingId,
          {
            category,
            amount,
            month,
            year,
          },
        )

      } else {

        await createBudget({
          category,
          amount,
          month,
          year,
        })

      }

      resetForm()

      await loadData()

    } catch (error) {

      console.error(error)

      alert(
        error instanceof Error
          ? error.message
          : 'Failed to save budget',
      )
    }
  }

  function resetForm() {

    setCategory('food')

    setAmount('')

    setMonth(
      new Date().getMonth() + 1,
    )

    setYear(
      new Date().getFullYear(),
    )

    setEditingId(null)
  }

  function startEditing(
    budget: Budget,
  ) {

    setEditingId(
      budget._id,
    )

    setCategory(
      budget.category,
    )

    setAmount(
      String(budget.amount),
    )

    setMonth(
      budget.month,
    )

    setYear(
      budget.year,
    )
  }

  async function handleDelete(
    id: string,
  ) {

    const confirmed =
      window.confirm(
        'Delete this budget?',
      )

    if (!confirmed) {
      return
    }

    try {

      await deleteBudget(id)

      setBudgets(
        (current) =>
          current.filter(
            (budget) =>
              budget._id !== id,
          ),
      )

      await loadData()

    } catch (error) {

      console.error(error)

      alert(
        'Failed to delete budget.',
      )
    }
  }

  function getMonthName(
    monthNumber: number,
  ) {

    return new Date(
      2026,
      monthNumber - 1,
      1,
    ).toLocaleString(
      'en-IN',
      {
        month: 'long',
      },
    )
  }

  function getSpendingForCategory(
    budget: Budget,
  ) {

    const item =
      spending.find(
        (entry) =>
          entry.category ===
            budget.category &&
          Number(entry.budget) ===
            Number(budget.amount),
      )

    return item?.spent ?? 0
  }

  function getPercentage(
    budget: Budget,
  ) {

    const spent =
      getSpendingForCategory(
        budget,
      )

    if (budget.amount <= 0) {
      return 0
    }

    return Math.min(
      (spent /
        Number(budget.amount)) *
        100,
      100,
    )
  }

  if (loading) {

    return (
      <section className="budget-manager">

        <h2>
          Monthly Budgets
        </h2>

        <p>
          Loading budgets...
        </p>

      </section>
    )
  }

  return (
    <section className="budget-manager">

      <h2>
        Monthly Budgets
      </h2>

      {/* Budget Form */}

      <form
        className="budget-form"
        onSubmit={handleSubmit}
      >

        <div className="form-group">

          <label>
            Category
          </label>

          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value,
              )
            }
          >

            {categories.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ),
            )}

          </select>

        </div>

        <div className="form-group">

          <label>
            Budget Amount
          </label>

          <input
            type="number"
            min="1"
            step="0.01"
            placeholder="5000"
            value={amount}
            onChange={(event) =>
              setAmount(
                event.target.value,
              )
            }
          />

        </div>

        <div className="form-group">

          <label>
            Month
          </label>

          <select
            value={month}
            onChange={(event) =>
              setMonth(
                Number(
                  event.target.value,
                ),
              )
            }
          >

            {Array.from(
              {
                length: 12,
              },
              (_, index) =>
                index + 1,
            ).map(
              (monthNumber) => (

                <option
                  key={monthNumber}
                  value={monthNumber}
                >
                  {getMonthName(
                    monthNumber,
                  )}
                </option>

              ),
            )}

          </select>

        </div>

        <div className="form-group">

          <label>
            Year
          </label>

          <input
            type="number"
            value={year}
            onChange={(event) =>
              setYear(
                Number(
                  event.target.value,
                ),
              )
            }
          />

        </div>

        <div className="budget-form-actions">

          <button type="submit">
            {editingId
              ? 'Update Budget'
              : 'Add Budget'}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}

        </div>

      </form>

      {/* Budget List */}

      <div className="budget-list">

        {budgets.length === 0 ? (

          <div className="empty-budget">

            <p>
              No budgets created yet.
            </p>

          </div>

        ) : (

          budgets.map(
            (budget) => {

              const spent =
                getSpendingForCategory(
                  budget,
                )

              const percentage =
                getPercentage(
                  budget,
                )

              return (
                <div
                  className="budget-card"
                  key={budget._id}
                >

                  <div className="budget-info">

                    <h3>
                      {budget.category}
                    </h3>

                    <p>
                      {getMonthName(
                        budget.month,
                      )}{' '}
                      {budget.year}
                    </p>

                    <strong>
                      ₹
                      {Number(
                        budget.amount,
                      ).toFixed(2)}
                    </strong>

                    <p>
                      Spent: ₹
                      {Number(
                        spent,
                      ).toFixed(2)}
                    </p>

                    <div className="budget-progress">

                      <div
                        className="budget-progress-bar"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>

                    <small>
                      {percentage.toFixed(
                        1,
                      )}
                      % used
                    </small>

                  </div>

                  <div className="budget-actions">

                    <button
                      type="button"
                      onClick={() =>
                        startEditing(
                          budget,
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          budget._id,
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>
              )
            },
          )

        )}

      </div>

    </section>
  )
}

export default BudgetManager