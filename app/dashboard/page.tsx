"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Plus, User, History, Sparkles } from "lucide-react"
import { BarChart, Bar, CartesianGrid, Cell, LabelList, LineChart, Line, XAxis, ResponsiveContainer } from "recharts"
import type { Expense } from "@/types/expense"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "@/lib/theme"
const STORAGE_KEY = "imbroke-expenses"

const CATEGORY_MAP: [RegExp, string][] = [
  [/uber|ola|metro|bus|train|fuel|petrol|diesel|cab|auto|taxi/i, "Transport"],
  [/grocery|vegetable|fruit|milk|bread|restaurant|zomato|swiggy|cafe|coffee|pizza|burger|food/i, "Food"],
  [/netflix|spotify|prime|hotstar|entertainment|movie|cinema|game|gaming|subscription|youtube/i, "Entertainment"],
  [/electricity|bill|rent|wifi|internet|phone|recharge|water|gas|maintenance|emi|loan/i, "Bills"],
  [/medical|doctor|hospital|pharmacy|medicine|health|gym|fitness|clinic|checkup/i, "Health"],
  [/amazon|flipkart|clothing|shoe|dress|watch|bag|mobile|laptop|gadget|electronics|furniture|decor/i, "Shopping"],
]

function categorize(title: string): string {
  for (const [pattern, category] of CATEGORY_MAP) {
    if (pattern.test(title)) return category
  }
  return "Other"
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: "text-orange-600 dark:text-orange-400",
  Transport: "text-blue-600 dark:text-blue-400",
  Shopping: "text-pink-600 dark:text-pink-400",
  Bills: "text-red-600 dark:text-red-400",
  Entertainment: "text-purple-600 dark:text-purple-400",
  Health: "text-green-600 dark:text-green-400",
  Other: "text-gray-600 dark:text-gray-400",
}

const AREA_CATEGORIES = [
  { key: "Food", color: "#f97316" },
  { key: "Transport", color: "#2563eb" },
  { key: "Shopping", color: "#ec4899" },
  { key: "Bills", color: "#ef4444" },
  { key: "Entertainment", color: "#8b5cf6" },
  { key: "Health", color: "#16a34a" },
  { key: "Other", color: "#6b7280" },
] as const

type AreaCategory = (typeof AREA_CATEGORIES)[number]["key"]



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
  const date = parseDate(dateStr)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function getWeekRange(date: Date) {
  const start = new Date(date)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1)
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function isToday(d: Date) {
  const today = new Date()
  return d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
}

function isThisWeek(d: Date) {
  const { start, end } = getWeekRange(new Date())
  return d >= start && d <= end
}

function isThisMonth(d: Date) {
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

type Period = "week" | "month"

const PERIOD_LABELS: Record<Period, string> = {
  week: "This week",
  month: "This month",
}

const PERIOD_FILTERS: Record<Period, (d: Date) => boolean> = {
  week: isThisWeek,
  month: isThisMonth,
}

const COMMON_EXPENSES = [
  "Grocery shopping", "Zomato order", "Swiggy order", "Cafe coffee",
  "Electricity bill", "Rent", "Wifi recharge", "Phone recharge",
  "Uber ride", "Ola ride", "Petrol", "Bus ticket",
  "Netflix subscription", "Movie ticket", "Spotify premium",
  "Amazon order", "Clothing", "Electronics",
  "Doctor visit", "Medicine", "Gym membership",
  "Salary", "Freelance payment",
]

function formatLocalIsoDate(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-")
}

function getDateRange(period: Period): string[] {
  const now = new Date()
  const days: string[] = []
  if (period === "week") {
    const { start } = getWeekRange(now)
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      days.push(formatLocalIsoDate(d))
    }
  } else {
    const y = now.getFullYear()
    const m = now.getMonth()
    const lastDay = new Date(y, m + 1, 0).getDate()
    for (let d = 1; d <= lastDay; d++) {
      const date = new Date(y, m, d)
      days.push(formatLocalIsoDate(date))
    }
  }
  return days
}

export default function DashboardPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedDate, setSelectedDate] = useState(formatLocalIsoDate(new Date()))
  const amountInputRef = useRef<HTMLInputElement | null>(null)
  const [period, setPeriod] = useState<Period>("week")
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [titleDone, setTitleDone] = useState(false)
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setExpenses(JSON.parse(stored) as Expense[])
    }
  }, [])

  const periodExpenses = useMemo(
    () => expenses.filter((e) => PERIOD_FILTERS[period](parseDate(e.date))),
    [expenses, period],
  )

  const filteredExpenses = useMemo(
    () => selectedCat ? periodExpenses.filter((e) => e.category === selectedCat) : periodExpenses,
    [periodExpenses, selectedCat],
  )

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

  useEffect(() => {
    if (titleDone) {
      amountInputRef.current?.focus()
    }
  }, [titleDone])

  useEffect(() => {
    const getResolvedTheme = () => {
      if (theme === "dark") return "dark"
      if (theme === "light") return "light"
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }

    setResolvedTheme(getResolvedTheme())

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = () => setResolvedTheme(getResolvedTheme())
      media.addEventListener?.("change", handleChange)
      media.addListener?.(handleChange)
      return () => {
        media.removeEventListener?.("change", handleChange)
        media.removeListener?.(handleChange)
      }
    }

    return undefined
  }, [theme])

  const allCategories = useMemo(() => {
    const set = new Set<string>()
    for (const e of periodExpenses) set.add(e.category)
    return Array.from(set).sort()
  }, [periodExpenses])

  const suggestions = useMemo(() => {
    if (!title.trim()) return COMMON_EXPENSES
    return COMMON_EXPENSES.filter((e) =>
      e.toLowerCase().includes(title.toLowerCase())
    ).slice(0, 5)
  }, [title])

  const detectedCategory = title.trim() ? categorize(title.trim()) : null

  const barChartData = useMemo(() => {
    const daily: Record<string, number> = {}
    for (const e of filteredExpenses) {
      daily[e.date] = (daily[e.date] || 0) + e.amount
    }
    const range = getDateRange(period)
    return range.map((date) => {
      const dayLabel = parseDate(date).toLocaleDateString("en-US", { weekday: "short", day: "numeric" })
      return {
        date: dayLabel,
        total: daily[date] || 0,
        isToday: isToday(parseDate(date)),
      }
    })
  }, [filteredExpenses, period])

  const chartData = useMemo(() => {
    const range = getDateRange(period)
    const initial = range.map((date) => {
      const dataPoint: Record<string, number | string> = {
        date: parseDate(date).toLocaleDateString("en-US", { weekday: "short", day: "numeric" }),
      }

      AREA_CATEGORIES.forEach(({ key }) => {
        dataPoint[key] = 0
      })

      return { rawDate: date, ...dataPoint } as Record<string, number | string>
    })

    for (const expense of periodExpenses) {
      const row = initial.find((item) => item.rawDate === expense.date)
      if (row) {
        row[expense.category as AreaCategory] = (row[expense.category as AreaCategory] as number) + expense.amount
      }
    }

    return initial.map(({ rawDate, ...rest }) => rest)
  }, [periodExpenses, period])

  function selectSuggestion(s: string) {
    setTitle(s)
    setTitleDone(true)
  }

  const handleAdd = useCallback(async () => {
    if (!title.trim() || !amount.trim()) return
    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount <= 0) return

    const newExpense: Expense = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      title: title.trim(),
      amount: numAmount,
      category: categorize(title.trim()),
      date: selectedDate,
    }

    setExpenses((prev) => {
      const updated = [newExpense, ...prev]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
    setTitle("")
    setAmount("")
    setShowForm(false)
  }, [title, amount, selectedDate])

  function openForm() {
    setTitle("")
    setAmount("")
    setSelectedDate(formatLocalIsoDate(new Date()))
    setTitleDone(false)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setTitle("")
    setAmount("")
    setSelectedDate(formatLocalIsoDate(new Date()))
    setTitleDone(false)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-white dark:bg-gray-950">
      <div className="px-5 pt-10 pb-3">
        <div className="flex items-center justify-between gap-3 pb-4">
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="flex items-center gap-3 text-gray-900 transition duration-150 ease-out hover:text-gray-900 active:scale-95 active:opacity-80 dark:text-gray-50"
            aria-label="Go to profile"
          >
            <User size={20} />
          </button>

          <button
            type="button"
            onClick={() => router.push("/history")}
            className="text-gray-700 transition duration-150 ease-out hover:text-gray-900 active:scale-95 active:opacity-80 dark:text-gray-100 dark:hover:text-white"
            aria-label="View history"
          >
            <History size={20} />
          </button>
        </div>

        <div className="flex items-center justify-between pr-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total expenses</p>
        </div>
        <p className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50">{formatCurrency(totalExpenses)}</p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Showing {PERIOD_LABELS[period].toLowerCase()}</p>
        <div className="mt-4 flex gap-2">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                period === p
                  ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCat(null)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              selectedCat === null
                ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            All
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(selectedCat === cat ? null : cat)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                selectedCat === cat
                  ? "text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
              style={selectedCat === cat ? { backgroundColor: "#111111" } : undefined}
            >
              {cat}
            </button>
          ))}
        </div>


        {totalExpenses === 0 && (
          <div className="mt-6 rounded-3xl bg-white/0 px-2 py-4 text-center text-sm leading-6 text-gray-600 dark:text-gray-300">
            <div className="mb-2 text-orange-500 dark:text-orange-300">
              <Sparkles size={32} className="mx-auto mb-4" />
            </div>
            No expenses yet. Add your first spend to start tracking your budget, watch charts come alive, and take control of your money.
          </div>
        )}
        {totalExpenses > 0 && (
          <div className="mt-4 rounded-xl bg-gray-50 px-4 pb-3 pt-5 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Daily totals</p>
            </div>
            <div className="pointer-events-none">
              <ResponsiveContainer width="100%" height={280}>
                {period === "week" ? (
                  <BarChart data={barChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barCategoryGap={6}>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                    <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                      <LabelList
                        dataKey="total"
                        position="inside"
                        angle={90}
                        formatter={(value) => formatCurrency(Number(value))}
                        style={{
                          fontSize: 10,
                          fill: resolvedTheme === "dark" ? "#111111" : "white",
                          fontWeight: "bold",
                        }}
                      />
                      {barChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.isToday ? "#f97316" : resolvedTheme === "dark" ? "#ffffff" : "#111111"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <LineChart data={barChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={false}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 pb-28" />

      {showForm && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30 sm:items-center" onClick={closeForm}>
          <div
            className="w-full max-w-lg rounded-t-2xl bg-white px-5 pb-8 pt-6 shadow-xl dark:bg-gray-900 dark:shadow-gray-950/50 sm:rounded-2xl sm:mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Add expense</h2>
              <button onClick={closeForm} className="rounded-full p-1 text-gray-400 transition duration-150 ease-out hover:bg-gray-100 hover:text-gray-600 active:scale-95 active:bg-gray-200 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300 dark:active:bg-gray-700">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="What did you spend on?"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setTitleDone(false) }}
                  className="w-full rounded-2xl border border-gray-200 px-5 py-4 text-lg font-medium outline-none transition focus:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-gray-500"
                  autoFocus
                />

                {title.trim() && !titleDone && suggestions.length > 0 && (
                  <div className="mt-1 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-950/50">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => selectSuggestion(s)}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        {s}
                      </button>
                    ))}
                    <button
                      onClick={() => setTitleDone(true)}
                      className="w-full border-t border-gray-100 px-4 py-2.5 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700"
                    >
                      Continue with &quot;{title}&quot;
                    </button>
                  </div>
                )}

                {title.trim() && !titleDone && suggestions.length === 0 && (
                  <button
                    onClick={() => setTitleDone(true)}
                    className="mt-3 w-full rounded-xl bg-gray-100 px-4 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Continue with &quot;{title}&quot;
                  </button>
                )}
              </div>

              {titleDone && (
                <div className="mt-1 flex flex-row flex-wrap gap-3">
                  <div className="flex-1 min-w-[45%]">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 px-5 py-4 text-lg font-medium text-gray-900 outline-none transition focus:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-gray-500"
                      style={{ appearance: "none" }}
                    />
                  </div>
                  <div className="flex-1 min-w-[45%]">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-gray-400 dark:text-gray-500">₹</span>
                      <input
                        ref={amountInputRef}
                        type="text"
                        inputMode="decimal"
                        pattern="^[0-9]*\.?[0-9]*$"
                        placeholder="0"
                        value={amount}
                        onChange={(e) => {
                          const next = e.target.value
                          if (next === "" || /^[0-9]*\.?[0-9]*$/.test(next)) {
                            setAmount(next)
                          }
                        }}
                        className="w-full rounded-2xl border border-gray-200 px-5 py-4 pl-10 text-lg font-medium text-gray-900 outline-none transition focus:border-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-gray-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {titleDone && (
                <button
                  onClick={handleAdd}
                  disabled={!amount.trim() || Number(amount) <= 0}
                  className="mt-4 w-full rounded-2xl bg-gray-900 py-4 text-base font-semibold text-white hover:bg-gray-800 disabled:opacity-40 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
                >
                  Add expense
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={openForm}
        className="fixed bottom-6 right-6 z-30 flex size-14 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition duration-150 ease-out hover:bg-gray-800 active:scale-95 active:shadow-none dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 dark:shadow-gray-950/50"
      >
        <Plus size={24} />
      </button>
    </div>
  )
}
