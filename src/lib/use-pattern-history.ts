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

  function exportHistory() {
    return JSON.stringify(history, null, 2)
  }

  function importHistory(json: string): boolean {
    try {
      const parsed = JSON.parse(json)
      if (!Array.isArray(parsed)) return false
      const valid = parsed.every(
        (entry) =>
          typeof entry.pattern === "string" &&
          typeof entry.flags === "string" &&
          typeof entry.savedAt === "number"
      )
      if (!valid) return false
      setHistory(parsed)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      return true
    } catch {
      return false
    }
  }


  return { history, addEntry, clearHistory, exportHistory, importHistory }
}