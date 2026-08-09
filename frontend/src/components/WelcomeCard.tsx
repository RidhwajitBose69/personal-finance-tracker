import { useState } from 'react'

interface WelcomeCardProps {
  name: string
}

function WelcomeCard({ name }: WelcomeCardProps) {
  const [expense, setExpense] = useState('')

  return (
    <div>
      <h2>Welcome, {name}!</h2>

      <p>Track your spending and work toward your financial goals.</p>

      <input
        type="text"
        placeholder="Enter an expense"
        value={expense}
        onChange={(event) => setExpense(event.target.value)}
      />

      <p>Current input: {expense}</p>
    </div>
  )
}

export default WelcomeCard