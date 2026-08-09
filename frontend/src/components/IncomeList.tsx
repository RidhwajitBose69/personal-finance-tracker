import { useMemo, useState } from 'react'

import {
  deleteIncome,
  updateIncome,
} from '../services/api'

import type { Income } from '../services/api'

interface IncomeListProps {
  income: Income[]
  onIncomeChanged: () => void
}

function IncomeList({
  income,
  onIncomeChanged,
}: IncomeListProps) {
  const [search, setSearch] =
    useState('')

  const [editingId, setEditingId] =
    useState<string | null>(null)

  const [source, setSource] =
    useState('')

  const [amount, setAmount] =
    useState('')

  const [description, setDescription] =
    useState('')

  const [date, setDate] =
    useState('')

  const filteredIncome =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase()

      return income.filter(
        (item) =>
          !query ||
          item.source
            .toLowerCase()
            .includes(query) ||
          item.description
            ?.toLowerCase()
            .includes(query),
      )
    }, [income, search])

  function startEditing(
    item: Income,
  ) {
    setEditingId(item._id)
    setSource(item.source)
    setAmount(
      String(item.amount),
    )
    setDescription(
      item.description || '',
    )
    setDate(
      new Date(item.date)
        .toISOString()
        .split('T')[0],
    )
  }

  function cancelEditing() {
    setEditingId(null)
    setSource('')
    setAmount('')
    setDescription('')
    setDate('')
  }

  async function saveEdit() {
    if (!editingId) {
      return
    }

    try {
      await updateIncome(
        editingId,
        {
          amount: Number(amount),
          source: source.trim(),
          description:
            description.trim(),
          date,
        },
      )

      cancelEditing()
      onIncomeChanged()
    } catch (error) {
      console.error(error)

      alert(
        error instanceof Error
          ? error.message
          : 'Failed to update income.',
      )
    }
  }

  async function handleDelete(
    id: string,
  ) {
    if (
      !window.confirm(
        'Delete this income entry?',
      )
    ) {
      return
    }

    try {
      await deleteIncome(id)

      onIncomeChanged()
    } catch (error) {
      console.error(error)

      alert(
        error instanceof Error
          ? error.message
          : 'Failed to delete income.',
      )
    }
  }

  function formatDate(
    value: string,
  ) {
    return new Date(
      value,
    ).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    )
  }

  return (
    <div className="income-list">

      <div className="income-controls">
        <input
          type="text"
          placeholder="Search income..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value,
            )
          }
        />
      </div>

      {filteredIncome.length === 0 ? (
        <div className="empty-state">
          <h3>
            No income found
          </h3>

          <p>
            Add your first income
            entry above.
          </p>
        </div>
      ) : (
        <div className="income-items">

          {filteredIncome.map(
            (item) => (
              <div
                className="income-card"
                key={item._id}
              >

                {editingId ===
                item._id ? (
                  <div className="income-edit-form">

                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={(event) =>
                        setAmount(
                          event.target.value,
                        )
                      }
                    />

                    <input
                      type="text"
                      value={source}
                      onChange={(event) =>
                        setSource(
                          event.target.value,
                        )
                      }
                    />

                    <input
                      type="text"
                      value={description}
                      onChange={(event) =>
                        setDescription(
                          event.target.value,
                        )
                      }
                    />

                    <input
                      type="date"
                      value={date}
                      onChange={(event) =>
                        setDate(
                          event.target.value,
                        )
                      }
                    />

                    <div className="income-actions">

                      <button
                        type="button"
                        onClick={
                          saveEdit
                        }
                      >
                        Save
                      </button>

                      <button
                        type="button"
                        onClick={
                          cancelEditing
                        }
                      >
                        Cancel
                      </button>

                    </div>

                  </div>
                ) : (
                  <>
                    <div className="income-info">

                      <div>
                        <h3>
                          {item.source}
                        </h3>

                        {item.description && (
                          <p>
                            {
                              item.description
                            }
                          </p>
                        )}

                        <small>
                          {formatDate(
                            item.date,
                          )}
                        </small>
                      </div>

                      <strong className="income-amount">
                        +₹
                        {item.amount.toFixed(
                          2,
                        )}
                      </strong>

                    </div>

                    <div className="income-actions">

                      <button
                        type="button"
                        onClick={() =>
                          startEditing(
                            item,
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            item._id,
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>
                  </>
                )}

              </div>
            ),
          )}

        </div>
      )}

    </div>
  )
}

export default IncomeList