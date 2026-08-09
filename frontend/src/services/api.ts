const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export interface User { id: string; name: string; email: string; currentBankBalance: number; createdAt?: string }
export interface AuthResponse { token: string; user: User }

export function getToken(): string | null { return localStorage.getItem('fintrack_token') }
export function setToken(token: string) { localStorage.setItem('fintrack_token', token) }
export function clearToken() { localStorage.removeItem('fintrack_token') }

// ============================================================
// TYPES
// ============================================================

export interface Expense {
  _id: string
  amount: number
  category: string
  description: string
  date: string
  createdAt?: string
  updatedAt?: string
}

export interface Income {
  _id: string
  amount: number
  source: string
  description?: string
  date: string
  createdAt?: string
  updatedAt?: string
}

export interface Budget {
  _id: string
  category: string
  amount: number
  month: number
  year: number
  createdAt?: string
  updatedAt?: string
}

export interface BudgetSpending {
  category: string
  budget: number
  spent: number
  remaining: number
  percentage: number
}

export interface CategorySummary {
  category: string
  total: number
}

export interface MonthlySummary {
  year: number
  month: number
  total: number
}

export interface IncomeSummary {
  total: number
}

export interface AIInsight {
  title: string
  message: string
  type: 'positive' | 'warning' | 'info'
}

export interface AIInsightData {
  summary: string
  insights: AIInsight[]
}

// ============================================================
// REQUEST HELPER
// ============================================================

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        ...(options?.headers || {}),
      },
      ...options,
    },
  )

  let data: unknown

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof data.message === 'string'
        ? data.message
        : 'Something went wrong'

    throw new Error(message)
  }

  return data as T
}

// ============================================================
// AUTH
// ============================================================
export async function register(data: { name: string; email: string; password: string; currentBankBalance: number }): Promise<AuthResponse> { return request<AuthResponse>('/auth/register', { method:'POST', body:JSON.stringify(data) }) }
export async function login(data: { email: string; password: string }): Promise<AuthResponse> { return request<AuthResponse>('/auth/login', { method:'POST', body:JSON.stringify(data) }) }
export async function getMe(): Promise<{ user: User }> { return request<{ user: User }>('/auth/me') }
export async function updateProfile(data: { name?: string; currentBankBalance?: number }): Promise<{ user: User }> { return request<{ user: User }>('/auth/profile', { method:'PUT', body:JSON.stringify(data) }) }
export async function changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> { return request<{ message:string }>('/auth/change-password', { method:'POST', body:JSON.stringify(data) }) }

// ============================================================
// HEALTH
// ============================================================

export async function checkHealth(): Promise<{
  status: string
  message: string
}> {
  return request('/health')
}

// ============================================================
// EXPENSES
// ============================================================

export async function getExpenses(): Promise<Expense[]> {
  return request<Expense[]>('/expenses')
}

export async function getExpense(
  id: string,
): Promise<Expense> {
  return request<Expense>(
    `/expenses/${id}`,
  )
}

export async function createExpense(data: {
  amount: number | string
  category: string
  description: string
  date?: string
}): Promise<Expense> {
  return request<Expense>(
    '/expenses',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  )
}

export async function updateExpense(
  id: string,
  data: {
    amount: number | string
    category: string
    description: string
    date?: string
  },
): Promise<Expense> {
  return request<Expense>(
    `/expenses/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
  )
}

export async function deleteExpense(
  id: string,
): Promise<{ message: string }> {
  return request<{
    message: string
  }>(
    `/expenses/${id}`,
    {
      method: 'DELETE',
    },
  )
}

// ============================================================
// EXPENSE SUMMARIES
// ============================================================

export async function getCategorySummary(): Promise<
  CategorySummary[]
> {
  return request<CategorySummary[]>(
    '/expenses/summary/categories',
  )
}

export async function getMonthlySummary(): Promise<
  MonthlySummary[]
> {
  return request<MonthlySummary[]>(
    '/expenses/summary/monthly',
  )
}

// ============================================================
// INCOME
// ============================================================

export async function getIncome(): Promise<Income[]> {
  return request<Income[]>('/income')
}

export async function getIncomeById(
  id: string,
): Promise<Income> {
  return request<Income>(
    `/income/${id}`,
  )
}

export async function createIncome(data: {
  amount: number | string
  source: string
  description?: string
  date?: string
}): Promise<Income> {
  return request<Income>(
    '/income',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  )
}

export async function updateIncome(
  id: string,
  data: {
    amount: number | string
    source: string
    description?: string
    date?: string
  },
): Promise<Income> {
  return request<Income>(
    `/income/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
  )
}

export async function deleteIncome(
  id: string,
): Promise<{ message: string }> {
  return request<{
    message: string
  }>(
    `/income/${id}`,
    {
      method: 'DELETE',
    },
  )
}

export async function getIncomeSummary(): Promise<IncomeSummary> {
  return request<IncomeSummary>(
    '/income/summary',
  )
}

// ============================================================
// BUDGETS
// ============================================================

export async function getBudgets(): Promise<Budget[]> {
  return request<Budget[]>('/budgets')
}

export async function createBudget(data: {
  category: string
  amount: number | string
  month: number
  year: number
}): Promise<Budget> {
  return request<Budget>(
    '/budgets',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  )
}

export async function updateBudget(
  id: string,
  data: {
    category: string
    amount: number | string
    month: number
    year: number
  },
): Promise<Budget> {
  return request<Budget>(
    `/budgets/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
  )
}

export async function deleteBudget(
  id: string,
): Promise<{ message: string }> {
  return request<{
    message: string
  }>(
    `/budgets/${id}`,
    {
      method: 'DELETE',
    },
  )
}

// ============================================================
// BUDGET SPENDING
// ============================================================

export async function getBudgetSpending(
  month: number,
  year: number,
): Promise<BudgetSpending[]> {
  return request<BudgetSpending[]>(
    `/budgets/spending?month=${month}&year=${year}`,
  )
}

// ============================================================
// AI INSIGHTS
// ============================================================

export async function getAIInsights(): Promise<AIInsightData> {
  return request<AIInsightData>(
    '/ai/insights',
  )
}

// ============================================================
// MONEY OWED
// ============================================================
export interface Debt { _id:string; person:string; amount:number; type:'lent'|'borrowed'; description:string; date:string; dueDate?:string; status:'pending'|'settled'; createdAt?:string; updatedAt?:string }
export interface DebtSummary { lent:number; borrowed:number; net:number }
export async function getDebts():Promise<Debt[]> { return request<Debt[]>('/debts') }
export async function createDebt(data: {person:string;amount:number|string;type:'lent'|'borrowed';description?:string;date?:string;dueDate?:string}):Promise<Debt>{return request<Debt>('/debts',{method:'POST',body:JSON.stringify(data)})}
export async function updateDebt(id:string,data: {person:string;amount:number|string;type:'lent'|'borrowed';description?:string;date?:string;dueDate?:string;status:'pending'|'settled'}):Promise<Debt>{return request<Debt>(`/debts/${id}`,{method:'PUT',body:JSON.stringify(data)})}
export async function settleDebt(id:string):Promise<Debt>{return request<Debt>(`/debts/${id}/settle`,{method:'PATCH'})}
export async function deleteDebt(id:string):Promise<{message:string}>{return request<{message:string}>(`/debts/${id}`,{method:'DELETE'})}
export async function getDebtSummary():Promise<DebtSummary>{return request<DebtSummary>('/debts/summary')}
