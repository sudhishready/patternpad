"use client"

import { useEffect, useState } from "react"

export type HistoryEntry = {
  pattern: string
  flags: string
  savedAt: number
}

const STORAGE_KEY = "patternpad-history"
const MAX_ENTRIES = 20
export function usePatternHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        setHistory(JSON.parse(raw))
      } catch {
        setHistory([])
      }
    }
  }, [])

  function addEntry(pattern: string, flags: string) {
    if (!pattern.trim()) return
    setHistory((prev) => {
      const withoutDupes = prev.filter(
        (entry) => entry.pattern !== pattern || entry.flags !== flags
      )
      const next = [{ pattern, flags, savedAt: Date.now() }, ...withoutDupes].slice(
        0,
        MAX_ENTRIES
      )
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  function clearHistory() {
    setHistory([])
    window.localStorage.removeItem(STORAGE_KEY)
  }

  return { history, addEntry, clearHistory }
}