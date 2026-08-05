"use client"

import { useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { commonPatterns, cheatsheet } from "@/lib/regex-data"

type FlagKey = "g" | "i" | "m" | "s"
export function RegexTester() {
  const [pattern, setPattern] = useState("[\w.-]+@[\w.-]+\.\w+")
  const [testString, setTestString] = useState(
    "contact me at jordan.dev@gmail.com or admin@site.io"
  )
  const [flags, setFlags] = useState<Record<FlagKey, boolean>>({
    g: true,
    i: false,
    m: false,
    s: false,
  })

  const flagString = useMemo(() => {
    return (Object.keys(flags) as FlagKey[]).filter((k) => flags[k]).join("")
  }, [flags])
  const { regex, error } = useMemo(() => {
    try {
      return { regex: new RegExp(pattern, flagString), error: null }
    } catch (e) {
      return { regex: null, error: (e as Error).message }
    }
  }, [pattern, flagString])

  const matches = useMemo(() => {
    if (!regex) return []
    if (!flagString.includes("g")) {
      const m = testString.match(regex)
      return m ? [m] : []
    }
    return Array.from(testString.matchAll(regex))
  }, [regex, testString, flagString])
  const highlighted = useMemo(() => {
    if (!regex || matches.length === 0) {
      return [{ text: testString, isMatch: false }]
    }
    const parts: { text: string; isMatch: boolean }[] = []
    let lastIndex = 0
    for (const m of matches) {
      const start = m.index ?? 0
      const end = start + m[0].length
      if (start > lastIndex) {
        parts.push({ text: testString.slice(lastIndex, start), isMatch: false })
      }
      parts.push({ text: testString.slice(start, end), isMatch: true })
      lastIndex = end
    }
    if (lastIndex < testString.length) {
      parts.push({ text: testString.slice(lastIndex), isMatch: false })
    }
    return parts
  }, [matches, testString, regex])
  function toggleFlag(key: FlagKey) {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }))
  }
  function loadExample(p: string, f: string, sample: string) {
    setPattern(p)
    setTestString(sample)
    setFlags({
      g: f.includes("g"),
      i: f.includes("i"),
      m: f.includes("m"),
      s: f.includes("s"),
    })
  }
