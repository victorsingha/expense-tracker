"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Trash2, Info } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useCallback, useState, useEffect } from "react"
import type { Expense } from "@/types/expense"

const STORAGE_KEY = "imbroke-expenses"

export default function ProfilePage() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setExpenses(JSON.parse(stored) as Expense[])
    }
  }, [])

  const handleClearAll = useCallback(() => {
    if (window.confirm("Are you sure you want to clear all expenses? This cannot be undone.")) {
      setExpenses([])
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const handleDownload = useCallback(() => {
    const payload = JSON.stringify(expenses, null, 2)
    const blob = new Blob([payload], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "expenses.json"
    anchor.click()
    URL.revokeObjectURL(url)
  }, [expenses])

  return (
    <div className="mx-auto min-h-screen max-w-lg flex flex-col bg-white dark:bg-gray-950">
      <div className="px-5 pt-10 pb-8">
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="text-gray-700 transition hover:text-gray-900 dark:text-gray-100 dark:hover:text-white"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Profile</h1>
          <div className="w-5" />
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-gray-50 px-5 py-4 dark:bg-gray-900">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
              <ThemeToggle />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Choose between light and dark mode</p>
          </div>

          <button
            onClick={handleDownload}
            className="w-full rounded-2xl bg-gray-50 px-5 py-4 text-left transition hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download size={18} className="text-gray-700 dark:text-gray-300" />
                <span className="font-medium text-gray-900 dark:text-gray-50">Download JSON</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Export all your expenses as a JSON file</p>
          </button>

          <button
            onClick={handleClearAll}
            className="w-full rounded-2xl bg-red-50 px-5 py-4 text-left transition hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                <span className="font-medium text-red-700 dark:text-red-400">Clear all data</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-red-600 dark:text-red-300">Delete all expenses permanently</p>
          </button>

          <button
            onClick={() => router.push("/")}
            className="w-full rounded-2xl bg-gray-50 px-5 py-4 text-left transition hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Info size={18} className="text-gray-700 dark:text-gray-300" />
                <span className="font-medium text-gray-900 dark:text-gray-50">About</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Learn more about i-m-broke</p>
          </button>
        </div>
      </div>
    </div>
  )
}
