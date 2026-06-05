"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import type { Expense } from "@/types/expense"

const STORAGE_KEY = "imbroke-expenses"

const CATEGORY_COLORS: Record<string, string> = {
  Food: "text-orange-600 dark:text-orange-400",
  Transport: "text-blue-600 dark:text-blue-400",
  Shopping: "text-pink-600 dark:text-pink-400",
  Bills: "text-red-600 dark:text-red-400",
  Entertainment: "text-purple-600 dark:text-purple-400",
  Health: "text-green-600 dark:text-green-400",
  Other: "text-gray-600 dark:text-gray-400",
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function formatDate(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export default function HistoryPage() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setExpenses(JSON.parse(stored) as Expense[])
    }
  }, [])

  const sortedExpenses = useMemo(
    () => [...expenses].sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime()),
    [expenses],
  )

  const filteredExpenses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return sortedExpenses

    return sortedExpenses.filter((expense) =>
      expense.title.toLowerCase().includes(query) ||
      expense.category.toLowerCase().includes(query) ||
      formatDate(expense.date).toLowerCase().includes(query),
    )
  }, [sortedExpenses, searchQuery])

  const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  const handleRemoveExpense = useCallback((id: string) => {
    setExpenses((prev) => {
      const next = prev.filter((expense) => expense.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return (
    <div className="mx-auto min-h-screen max-w-lg flex flex-col">
      <div className="sticky top-0 z-10 bg-white px-5 pb-4 pt-10 dark:bg-black">
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex-shrink-0 text-gray-700 transition duration-150 ease-out hover:text-gray-900 active:scale-95 active:opacity-80 dark:text-gray-100 dark:hover:text-white"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="relative flex-1">
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by title, category, or date"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-orange-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-gray-500 dark:focus:ring-orange-500/20"
              />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-sm font-semibold tracking-wider  text-gray-500 dark:text-gray-400">
              Total Expenses
            </p>

            <h1 className="mt-2 text-5xl font-extrabold tracking-tight">
              {formatCurrency(total)}
            </h1>

          </div>

        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-16">
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {filteredExpenses.length === 0 ? (
            <li className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              {searchQuery.trim()
                ? "No expenses match your search."
                : "No expenses recorded."}
            </li>
          ) : (
            filteredExpenses.map((expense) => (
              <li key={expense.id} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0 flex-1 pr-4">
                  <p className="truncate font-medium text-gray-900 dark:text-gray-50">{expense.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className={`px-1.5 font-semibold ${CATEGORY_COLORS[expense.category] || "text-gray-600"}`}>
                      {expense.category}
                    </span>
                    <span>{formatDate(expense.date)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-50">
                    -{formatCurrency(expense.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveExpense(expense.id)}
                    className="text-xs font-semibold text-red-600 transition hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
