"use client"

import { useRouter } from "next/navigation"
import { GitBranchMinus, ArrowRight } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center dark:bg-gray-950">
      <div className="animate-fade-in flex flex-col items-center gap-8">
        <GitBranchMinus size={64} className="text-gray-900 dark:text-gray-50" />

        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
            i-m-broke
          </h1>
          <p className="mx-auto max-w-sm text-base text-gray-500 dark:text-gray-400">
            Stop wondering where your cash went. Track every penny, own your
            spending.
          </p>
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-4 text-base font-semibold text-white transition duration-200 ease-out hover:bg-gray-700 active:scale-105 active:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 dark:focus-visible:ring-offset-gray-950"
        >
          where is my money?
          <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
