import { useEffect, useState } from 'react'

import { getAIInsights } from '../services/api'

import type {
  AIInsightData,
} from '../services/api'

import type {
  Expense,
} from '../services/api'

interface AIInsightsProps {
  expenses: Expense[]
}

function AIInsights({
  expenses,
}: AIInsightsProps) {
  const [data, setData] =
    useState<AIInsightData | null>(null)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  async function generateInsights() {
    try {
      setLoading(true)
      setError(null)

      const result = await getAIInsights()

      setData(result)
    } catch (error) {
      console.error(
        'Failed to generate AI insights:',
        error,
      )

      setError(
        error instanceof Error
          ? error.message
          : 'Failed to generate financial insights',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (expenses.length > 0) {
      generateInsights()
    } else {
      setData(null)
    }
  }, [expenses.length])

  return (
    <section className="ai-insights">

      <div className="ai-header">

        <div>
          <h2>AI Financial Insights</h2>

          <p>
            Get personalized insights based on
            your spending habits.
          </p>
        </div>

        <button
          type="button"
          onClick={generateInsights}
          disabled={loading || expenses.length === 0}
        >
          {loading
            ? 'Analyzing...'
            : 'Generate Insights'}
        </button>

      </div>

      {expenses.length === 0 && (
        <div className="ai-empty">
          <p>
            Add some expenses first to generate
            AI-powered financial insights.
          </p>
        </div>
      )}

      {loading && (
        <div className="ai-loading">
          <p>
            Gemini is analyzing your spending...
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="ai-error">
          <h3>Unable to generate insights</h3>

          <p>{error}</p>

          <button
            type="button"
            onClick={generateInsights}
          >
            Try Again
          </button>
        </div>
      )}

      {data && !loading && !error && (
        <div className="ai-results">

          {/* Summary */}

          <div className="ai-summary">
            <h3>Summary</h3>

            <p>
              {data.summary}
            </p>
          </div>

          {/* Individual Insights */}

          <div className="insight-list">

            {data.insights.map(
              (insight, index) => (
                <div
                  className={`insight-card ${insight.type}`}
                  key={`${insight.title}-${index}`}
                >

                  <div className="insight-content">

                    <h3>
                      {insight.title}
                    </h3>

                    <p>
                      {insight.message}
                    </p>

                  </div>

                  <span className="insight-type">
                    {insight.type}
                  </span>

                </div>
              ),
            )}

          </div>

        </div>
      )}

    </section>
  )
}

export default AIInsights