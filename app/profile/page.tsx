"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Upload, Trash2, Info } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useCallback, useState, useEffect, useRef, type ChangeEvent } from "react"
import { read, utils, writeFile } from "xlsx"
import type { Expense } from "@/types/expense"

const STORAGE_KEY = "imbroke-expenses"

export default function ProfilePage() {
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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

  const handleDownloadExcel = useCallback(() => {
    if (expenses.length === 0) return

    const worksheet = utils.json_to_sheet(
      expenses.map((expense) => ({
        ID: expense.id,
        Title: expense.title,
        Amount: expense.amount,
        Category: expense.category,
        Date: expense.date,
      })),
    )
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, "Expenses")
    writeFile(workbook, "expenses.xlsx")
  }, [expenses])

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e.target?.result
      if (!data) return

      const workbook = read(data, { type: "array" })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" })

      const importedExpenses: Expense[] = rows.map((row) => ({
        id: String(row.ID || row.id || Date.now().toString(36)),
        title: String(row.Title || row.title || "Untitled expense"),
        amount: Number(row.Amount || row.amount || 0),
        category: String(row.Category || row.category || "Other"),
        date: String(row.Date || row.date || new Date().toISOString().slice(0, 10)),
      }))

      if (importedExpenses.some((expense) => !expense.title || !expense.date || isNaN(expense.amount))) {
        window.alert("Imported file contains invalid rows. Make sure columns include ID, Title, Amount, Category, and Date.")
        return
      }

      if (expenses.length > 0 && !window.confirm("Importing this file will replace your existing expenses. Continue?")) {
        if (event.target) {
          event.target.value = ""
        }
        return
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(importedExpenses))
      setExpenses(importedExpenses)
      if (event.target) {
        event.target.value = ""
      }
    }
    reader.readAsArrayBuffer(file)
  }, [expenses])

  return (
    <div className="mx-auto min-h-screen max-w-lg flex flex-col bg-white dark:bg-gray-950">
      <div className="px-5 pt-10 pb-8">
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="text-gray-700 transition duration-150 ease-out hover:text-gray-900 active:scale-95 active:opacity-80 dark:text-gray-100 dark:hover:text-white"
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
            onClick={handleDownloadExcel}
            className="w-full rounded-2xl bg-gray-50 px-5 py-4 text-left transition duration-150 ease-out hover:bg-gray-100 active:scale-95 active:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 dark:active:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download size={18} className="text-gray-700 dark:text-gray-300" />
                <span className="font-medium text-gray-900 dark:text-gray-50">Download Excel</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Export your expenses as an Excel workbook</p>
          </button>

          <button
            onClick={handleUploadClick}
            className="w-full rounded-2xl bg-gray-50 px-5 py-4 text-left transition duration-150 ease-out hover:bg-gray-100 active:scale-95 active:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 dark:active:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Upload size={18} className="text-gray-700 dark:text-gray-300" />
                <span className="font-medium text-gray-900 dark:text-gray-50">Upload Excel</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Import expenses from an Excel file to transfer data between devices</p>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleUpload}
          />

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
