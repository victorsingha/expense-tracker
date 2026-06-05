"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div
      key={pathname}
      style={{ animation: "fade-in 0.35s ease-out" }}
      className="min-h-full"
    >
      {children}
    </div>
  )
}
