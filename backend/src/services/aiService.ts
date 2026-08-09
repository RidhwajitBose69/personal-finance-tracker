import {
  GoogleGenerativeAI,
} from '@google/generative-ai'

export interface FinancialExpense {
  amount: number
  category: string
  description: string
  date: Date
}

export interface AIInsight {
  title: string
  message: string
  type:
    | 'positive'
    | 'warning'
    | 'info'
}

export interface AIInsightData {
  summary: string
  insights: AIInsight[]
}

function fallbackInsights(
  expenses: FinancialExpense[],
): AIInsightData {
  const total = expenses.reduce(
    (sum, expense) =>
      sum + expense.amount,
    0,
  )

  if (expenses.length === 0) {
    return {
      summary:
        'You do not have any expenses recorded yet.',
      insights: [
        {
          title: 'Start Tracking',
          message:
            'Add your first expense to begin receiving personalized financial insights.',
          type: 'info',
        },
      ],
    }
  }

  const categoryTotals =
    new Map<string, number>()

  for (const expense of expenses) {
    categoryTotals.set(
      expense.category,
      (categoryTotals.get(
        expense.category,
      ) || 0) + expense.amount,
    )
  }

  const largestCategory =
    [...categoryTotals.entries()].sort(
      (a, b) => b[1] - a[1],
    )[0]

  return {
    summary:
      `Your recorded spending is ₹${total.toFixed(2)} across ${expenses.length} transactions.`,

    insights: [
      {
        title: 'Largest Spending Category',
        message:
          `${largestCategory[0]} accounts for ₹${largestCategory[1].toFixed(2)} of your spending.`,
        type: 'info',
      },
      {
        title: 'Review Your Spending',
        message:
          'Keep monitoring your largest categories and compare them with your monthly budget.',
        type: 'warning',
      },
    ],
  }
}

export async function generateFinancialAdvice(
  expenses: FinancialExpense[],
): Promise<AIInsightData> {
  const apiKey =
    process.env.GEMINI_API_KEY

  if (!apiKey) {
    return fallbackInsights(expenses)
  }

  try {
    const ai =
      new GoogleGenerativeAI(apiKey)

    const model =
      ai.getGenerativeModel({
        model: 'gemini-2.5-flash',
      })

    const expenseData =
      expenses.map((expense) => ({
        amount: expense.amount,
        category: expense.category,
        description:
          expense.description,
        date: expense.date,
      }))

    const prompt = `
You are a personal finance assistant.

Analyze the following expense data.

${JSON.stringify(expenseData)}

Return ONLY valid JSON in this exact structure:

{
  "summary": "short financial summary",
  "insights": [
    {
      "title": "short title",
      "message": "useful actionable advice",
      "type": "positive"
    }
  ]
}

The type must be one of:
positive, warning, info.

Do not include markdown.
Do not include code fences.
Give 3 to 5 useful insights.
`

    const result =
      await model.generateContent(
        prompt,
      )

    const text =
      result.response.text().trim()

    const cleaned =
      text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim()

    return JSON.parse(
      cleaned,
    ) as AIInsightData
  } catch (error) {
    console.error(
      'AI generation failed:',
      error,
    )

    return fallbackInsights(expenses)
  }
}
