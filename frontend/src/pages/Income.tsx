import {
  useEffect,
  useState,
} from 'react'

import {
  createIncome,
  deleteIncome,
  getIncome,
  updateIncome,
} from '../services/api'

import type {
  Income as IncomeRecord,
} from '../services/api'

interface IncomeFormState {
  amount: string
  source: string
  description: string
  date: string
}

const initialForm: IncomeFormState = {
  amount: '',
  source: '',
  description: '',
  date: new Date()
    .toISOString()
    .split('T')[0],
}

function IncomePage() {
  const [income, setIncome] =
    useState<IncomeRecord[]>([])

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [editingId, setEditingId] =
    useState<string | null>(null)

  const [form, setForm] =
    useState<IncomeFormState>(
      initialForm,
    )

  const [error, setError] =
    useState('')

  async function loadIncome() {
    try {
      setLoading(true)
      setError('')

      const data =
        await getIncome()

      setIncome(data)
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load income',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadIncome()
  }, [])

  function handleChange(
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) {
    const { name, value } =
      event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function startEditing(
    record: IncomeRecord,
  ) {
    setEditingId(record._id)

    setForm({
      amount: String(record.amount),
      source: record.source,
      description:
        record.description || '',
      date: new Date(record.date)
        .toISOString()
        .split('T')[0],
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function cancelEditing() {
    setEditingId(null)
    setForm(initialForm)
    setError('')
  }

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault()

    const amount =
      Number(form.amount)

    if (!amount || amount <= 0) {
      setError(
        'Amount must be greater than 0.',
      )
      return
    }

    if (!form.source.trim()) {
      setError(
        'Income source is required.',
      )
      return
    }

    try {
      setSaving(true)
      setError('')

      const payload = {
        amount,
        source: form.source.trim(),
        description:
          form.description.trim(),
        date: form.date,
      }

      if (editingId) {
        await updateIncome(
          editingId,
          payload,
        )
      } else {
        await createIncome(payload)
      }

      setForm(initialForm)
      setEditingId(null)

      await loadIncome()
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save income',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(
    id: string,
  ) {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this income entry?',
      )

    if (!confirmed) {
      return
    }

    try {
      setError('')

      await deleteIncome(id)

      if (editingId === id) {
        cancelEditing()
      }

      await loadIncome()
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to delete income',
      )
    }
  }

  const totalIncome =
    income.reduce(
      (sum, item) =>
        sum + item.amount,
      0,
    )

  return (
    <div className="page">
      <div className="page-header">
        <h1>Income</h1>

        <p>
          Track your income and keep
          your finances organized.
        </p>
      </div>

      <section className="section-card">
        <h2>
          {editingId
            ? 'Edit Income'
            : 'Add Income'}
        </h2>

        {error && (
          <div
            className="error-message"
            role="alert"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="income-form"
        >
          <div className="form-group">
            <label htmlFor="amount">
              Amount
            </label>

            <input
              id="amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter amount"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="source">
              Source
            </label>

            <input
              id="source"
              name="source"
              type="text"
              placeholder="Salary, freelance, etc."
              value={form.source}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">
              Date
            </label>

            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              name="description"
              placeholder="Optional description"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="submit"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Update Income'
                  : 'Add Income'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="section-card">
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2>Income History</h2>

            <p>
              {income.length} entr
              {income.length === 1
                ? 'y'
                : 'ies'}
            </p>
          </div>

          <div>
            <strong>
              Total Income
            </strong>

            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
              }}
            >
              ₹
              {totalIncome.toLocaleString(
                'en-IN',
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <p>Loading income...</p>
        ) : income.length === 0 ? (
          <div className="empty-state">
            <h3>No income recorded</h3>

            <p>
              Add your first income entry
              above.
            </p>
          </div>
        ) : (
          <div className="income-list">
            {income.map((item) => (
              <article
                className="income-item"
                key={item._id}
              >
                <div>
                  <h3>
                    {item.source}
                  </h3>

                  {item.description && (
                    <p>
                      {item.description}
                    </p>
                  )}

                  <small>
                    {new Date(
                      item.date,
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

                <div
                  style={{
                    textAlign: 'right',
                  }}
                >
                  <strong>
                    +₹
                    {item.amount.toLocaleString(
                      'en-IN',
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )}
                  </strong>

                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      marginTop: '10px',
                    }}
                  >
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
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default IncomePage
