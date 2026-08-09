import { useState } from 'react'
import { createIncome } from '../services/api'

interface IncomeFormProps {
  onIncomeChanged: () => void
}

function IncomeForm({
  onIncomeChanged,
}: IncomeFormProps) {
  const [amount, setAmount] =
    useState('')

  const [source, setSource] =
    useState('')

  const [description, setDescription] =
    useState('')

  const [date, setDate] =
    useState(
      new Date()
        .toISOString()
        .split('T')[0],
    )

  const [saving, setSaving] =
    useState(false)

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault()

    if (
      !amount ||
      Number(amount) <= 0
    ) {
      alert(
        'Please enter a valid amount.',
      )
      return
    }

    if (!source.trim()) {
      alert(
        'Please enter the income source.',
      )
      return
    }

    try {
      setSaving(true)

      await createIncome({
        amount: Number(amount),
        source: source.trim(),
        description:
          description.trim(),
        date,
      })

      setAmount('')
      setSource('')
      setDescription('')

      setDate(
        new Date()
          .toISOString()
          .split('T')[0],
      )

      onIncomeChanged()
    } catch (error) {
      console.error(error)

      alert(
        error instanceof Error
          ? error.message
          : 'Failed to add income.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      className="income-form"
      onSubmit={handleSubmit}
    >
      <div>
        <label>
          Amount
        </label>

        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="₹ 0.00"
          value={amount}
          onChange={(event) =>
            setAmount(
              event.target.value,
            )
          }
          required
        />
      </div>

      <div>
        <label>
          Source
        </label>

        <input
          type="text"
          placeholder="Salary, freelance, allowance..."
          value={source}
          onChange={(event) =>
            setSource(
              event.target.value,
            )
          }
          required
        />
      </div>

      <div>
        <label>
          Description
        </label>

        <input
          type="text"
          placeholder="Optional description"
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value,
            )
          }
        />
      </div>

      <div>
        <label>
          Date
        </label>

        <input
          type="date"
          value={date}
          onChange={(event) =>
            setDate(
              event.target.value,
            )
          }
          required
        />
      </div>

      <button
        type="submit"
        disabled={saving}
      >
        {saving
          ? 'Adding...'
          : 'Add Income'}
      </button>
    </form>
  )
}

export default IncomeForm