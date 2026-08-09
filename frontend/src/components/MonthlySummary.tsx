import { useEffect, useState } from 'react'
import { getMonthlySummary } from '../services/api'

interface MonthlyData {
  year: number
  month: number
  total: number
}

interface MonthlySummaryProps {
  refreshTrigger: number
}

function MonthlySummary({ refreshTrigger }: MonthlySummaryProps) {
  const [data, setData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    getMonthlySummary()
      .then((result) => {
        setData(result)
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [refreshTrigger])

  if (loading) {
    return <p>Loading monthly summary...</p>
  }

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const currentMonthData = data.find(
    (item) =>
      item.year === currentYear &&
      item.month === currentMonth,
  )

  const currentMonthTotal = currentMonthData?.total ?? 0

  return (
    <div className="summary-card">
      <h3>This Month</h3>
      <p>₹{currentMonthTotal.toFixed(2)}</p>
    </div>
  )
}

export default MonthlySummary