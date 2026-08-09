import { useState } from 'react'
import {
  createExpense,
  updateExpense,
} from '../services/api'

import type { Expense } from '../services/api'

interface ExpenseFormProps {
  editingExpense: Expense | null
  onExpenseChanged: () => void
  onCancelEdit: () => void
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

function ExpenseForm({
  editingExpense,
  onExpenseChanged,
  onCancelEdit,
}: ExpenseFormProps) {
  const [amount, setAmount] = useState(
    editingExpense
      ? String(editingExpense.amount)
      : '',
  )

  const [category, setCategory] = useState(
    editingExpense?.category || 'food',
  )

  const [description, setDescription] =
    useState(
      editingExpense?.description || '',
    )

  const [date, setDate] = useState(
    editingExpense
      ? editingExpense.date.slice(0, 10)
      : new Date()
          .toISOString()
          .slice(0, 10),
  )

  const [loading, setLoading] =
    useState(false)

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault()

    if (!amount || Number(amount) <= 0) {
      alert(
        'Please enter a valid amount.',
      )
      return
    }

    if (!description.trim()) {
      alert(
        'Please enter a description.',
      )
      return
    }

    try {
      setLoading(true)

      const expenseData = {
        amount: Number(amount),
        category,
        description: description.trim(),
        date,
      }

      if (editingExpense) {
        await updateExpense(
          editingExpense._id,
          expenseData,
        )
      } else {
        await createExpense(expenseData)
      }

      setAmount('')
      setCategory('food')
      setDescription('')
      setDate(
        new Date()
          .toISOString()
          .slice(0, 10),
      )

      onExpenseChanged()
    } catch (error) {
      console.error(error)

      alert(
        error instanceof Error
          ? error.message
          : 'Failed to save expense.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="expense-form-section">
      <h2>
        {editingExpense
          ? 'Edit Expense'
          : 'Add Expense'}
      </h2>

      <form
        className="expense-form"
        onSubmit={handleSubmit}
      >
        <div className="form-group">
          <label htmlFor="amount">
            Amount
          </label>

          <input
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="500"
            value={amount}
            onChange={(event) =>
              setAmount(
                event.target.value,
              )
            }
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">
            Category
          </label>

          <select
            id="category"
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value,
              )
            }
          >
            {categories.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">
            Description
          </label>

          <input
            id="description"
            type="text"
            placeholder="Lunch, bus ticket, shopping..."
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">
            Date
          </label>

          <input
            id="date"
            type="date"
            value={date}
            onChange={(event) =>
              setDate(event.target.value)
            }
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Saving...'
              : editingExpense
                ? 'Update Expense'
                : 'Add Expense'}
          </button>

          {editingExpense && (
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  )
}

export default ExpenseForm