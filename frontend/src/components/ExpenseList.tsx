import { useMemo, useState } from 'react'

import {
  deleteExpense,
} from '../services/api'

import type {
  Expense,
} from '../services/api'

interface ExpenseListProps {
  expenses: Expense[]
  onEditExpense?: (
    expense: Expense,
  ) => void
  onExpenseChanged?: () => void
}

const categoryLabels: Record<string, string> = {
  food: 'Food',
  transport: 'Transport',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  bills: 'Bills',
  health: 'Health',
  education: 'Education',
  travel: 'Travel',
  other: 'Other',
}

function ExpenseList({
  expenses,
  onEditExpense,
  onExpenseChanged,
}: ExpenseListProps) {
  const [search, setSearch] =
    useState('')

  const [categoryFilter, setCategoryFilter] =
    useState('all')

  const [sortBy, setSortBy] =
    useState<'date' | 'amount'>('date')

  const [sortOrder, setSortOrder] =
    useState<'asc' | 'desc'>('desc')

  const [deletingId, setDeletingId] =
    useState<string | null>(null)

  const filteredExpenses =
    useMemo(() => {
      const result =
        expenses.filter((expense) => {
          const matchesSearch =
            expense.description
              .toLowerCase()
              .includes(
                search.toLowerCase(),
              )

          const matchesCategory =
            categoryFilter === 'all' ||
            expense.category ===
              categoryFilter

          return (
            matchesSearch &&
            matchesCategory
          )
        })

      result.sort((a, b) => {
        let comparison = 0

        if (sortBy === 'amount') {
          comparison =
            a.amount - b.amount
        } else {
          comparison =
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
        }

        return sortOrder === 'asc'
          ? comparison
          : -comparison
      })

      return result
    }, [
      expenses,
      search,
      categoryFilter,
      sortBy,
      sortOrder,
    ])

  async function handleDelete(
    id: string,
  ) {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this expense?',
      )

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(id)

      await deleteExpense(id)

      onExpenseChanged?.()
    } catch (error) {
      console.error(
        'Failed to delete expense:',
        error,
      )

      window.alert(
        error instanceof Error
          ? error.message
          : 'Failed to delete expense',
      )
    } finally {
      setDeletingId(null)
    }
  }

  const total =
    filteredExpenses.reduce(
      (sum, expense) =>
        sum + expense.amount,
      0,
    )

  return (
    <div className="expense-list">
      <div
        className="expense-list-controls"
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        <input
          type="text"
          placeholder="Search expenses..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          value={categoryFilter}
          onChange={(event) =>
            setCategoryFilter(
              event.target.value,
            )
          }
        >
          <option value="all">
            All categories
          </option>

          {Object.entries(
            categoryLabels,
          ).map(
            ([value, label]) => (
              <option
                key={value}
                value={value}
              >
                {label}
              </option>
            ),
          )}
        </select>

        <select
          value={sortBy}
          onChange={(event) =>
            setSortBy(
              event.target.value as
                | 'date'
                | 'amount',
            )
          }
        >
          <option value="date">
            Sort by date
          </option>

          <option value="amount">
            Sort by amount
          </option>
        </select>

        <button
          type="button"
          onClick={() =>
            setSortOrder(
              sortOrder === 'asc'
                ? 'desc'
                : 'asc',
            )
          }
        >
          {sortOrder === 'asc'
            ? '↑ Ascending'
            : '↓ Descending'}
        </button>
      </div>

      <div
        style={{
          marginBottom: '16px',
          fontWeight: 600,
        }}
      >
        Showing{' '}
        {filteredExpenses.length}{' '}
        expense
        {filteredExpenses.length !== 1
          ? 's'
          : ''}{' '}
        · ₹
        {total.toLocaleString(
          'en-IN',
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          },
        )}
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="empty-state">
          <h3>No expenses found</h3>

          <p>
            Try changing your search or
            category filter.
          </p>
        </div>
      ) : (
        <div className="expense-items">
          {filteredExpenses.map(
            (expense) => (
              <article
                className="expense-item"
                key={expense._id}
              >
                <div className="expense-item-main">
                  <div>
                    <h3>
                      {expense.description}
                    </h3>

                    <p>
                      {categoryLabels[
                        expense.category
                      ] ||
                        expense.category}
                    </p>

                    <small>
                      {new Date(
                        expense.date,
                      ).toLocaleDateString(
                        'en-IN',
                        {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        },
                      )}
                    </small>
                  </div>

                  <strong>
                    ₹
                    {expense.amount.toLocaleString(
                      'en-IN',
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )}
                  </strong>
                </div>

                <div
                  className="expense-item-actions"
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '12px',
                  }}
                >
                  {onEditExpense && (
                    <button
                      type="button"
                      onClick={() =>
                        onEditExpense(
                          expense,
                        )
                      }
                    >
                      Edit
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={
                      deletingId ===
                      expense._id
                    }
                    onClick={() =>
                      handleDelete(
                        expense._id,
                      )
                    }
                  >
                    {deletingId ===
                    expense._id
                      ? 'Deleting...'
                      : 'Delete'}
                  </button>
                </div>
              </article>
            ),
          )}
        </div>
      )}
    </div>
  )
}

export default ExpenseList
