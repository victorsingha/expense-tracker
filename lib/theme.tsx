"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

export type Theme = "system" | "light" | "dark"

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)
const STORAGE_KEY = "theme"
const DEFAULT_THEME: Theme = "system"
const SYSTEM_COLOR_SCHEME = "(prefers-color-scheme: dark)"

function getSystemTheme() {
  if (typeof window === "undefined") {
    return "light"
  }

  return window.matchMedia(SYSTEM_COLOR_SCHEME).matches ? "dark" : "light"
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const nextTheme = theme === "system" ? getSystemTheme() : theme

  root.classList.remove("light", "dark")
  root.classList.add(nextTheme)
  root.style.colorScheme = nextTheme
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") {
    return DEFAULT_THEME
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored
    }
  } catch {
    // ignore localStorage errors
  }

  return DEFAULT_THEME
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME)

  useEffect(() => {
    const storedTheme = getStoredTheme()
    setThemeState(storedTheme)
    applyTheme(storedTheme)
  }, [])

  useEffect(() => {
    if (theme !== "system") {
      return undefined
    }

    const media = window.matchMedia(SYSTEM_COLOR_SCHEME)
    const handleChange = () => applyTheme("system")

    media.addEventListener?.("change", handleChange)
    media.addListener?.(handleChange)

    return () => {
      media.removeEventListener?.("change", handleChange)
      media.removeListener?.(handleChange)
    }
  }, [theme])

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme)
    applyTheme(nextTheme)

    try {
      localStorage.setItem(STORAGE_KEY, nextTheme)
    } catch {
      // ignore localStorage errors
    }
  }, [])

  const value = useMemo(
    () => ({ theme, setTheme }),
    [theme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
