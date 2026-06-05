"use client"

import { useTheme } from "@/lib/theme"
import { Sun, Moon, Monitor } from "lucide-react"

const THEMES = ["system", "light", "dark"] as const
const ICONS = { system: Monitor, light: Sun, dark: Moon }

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  function cycle() {
    const idx = THEMES.indexOf(theme as (typeof THEMES)[number])
    setTheme(THEMES[(idx + 1) % THEMES.length])
  }

  const Icon = ICONS[theme as keyof typeof ICONS] ?? Monitor

  return (
    <button
      onClick={cycle}
      className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
      aria-label="Toggle theme"
    >
      <Icon size={18} />
    </button>
  )
}
