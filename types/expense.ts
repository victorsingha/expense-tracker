export interface Expense {
  id: string
  title: string
  amount: number
  category: string
  date: string
  note?: string
}

export type ExpenseCategory =
  | "Food"
  | "Transport"
  | "Shopping"
  | "Bills"
  | "Entertainment"
  | "Health"
  | "Other"
