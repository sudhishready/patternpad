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
  const [pattern, setPattern] = useState("[\\w.-]+@[\\w.-]+\\.\\w+")
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
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">patternpad</h1>
        <p className="text-muted-foreground mt-1">
          test your regex live, no more guessing in the console
        </p>
      </div>
      <Tabs defaultValue="tester">
        <TabsList>
          <TabsTrigger value="tester">tester</TabsTrigger>
          <TabsTrigger value="examples">examples</TabsTrigger>
          <TabsTrigger value="cheatsheet">cheatsheet</TabsTrigger>
        </TabsList>
        <TabsContent value="tester" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>your pattern</CardTitle>
              <CardDescription>
                {error ? (
                  <span className="text-red-500">{error}</span>
                ) : (
                  <span>
                    {matches.length} match{matches.length === 1 ? "" : "es"} found
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-lg">/</span>
                <Input
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="enter your regex pattern"
                  className="font-mono"
                />
                <span className="text-muted-foreground text-lg">/{flagString}</span>
              </div>
              <div className="flex flex-wrap gap-4">
                {(["g", "i", "m", "s"] as FlagKey[]).map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <Switch
                      id={`flag-${key}`}
                      checked={flags[key]}
                      onCheckedChange={() => toggleFlag(key)}
                    />
                    <Label htmlFor={`flag-${key}`} className="font-mono">
                      {key}
                    </Label>
                  </div>
                ))}
              </div>
              <Separator />
              <div>
                <Label className="mb-2 block">test string</Label>
                <Textarea
                  value={testString}
                  onChange={(e) => setTestString(e.target.value)}
                  rows={5}
                  className="font-mono"
                />
              </div>
              <div>
                <Label className="mb-2 block">result</Label>
                <div className="rounded-md border bg-muted/30 p-3 font-mono text-sm whitespace-pre-wrap break-words">
                  {highlighted.map((part, i) =>
                    part.isMatch ? (
                      <mark
                        key={i}
                        className="bg-yellow-300/60 rounded px-0.5 dark:bg-yellow-500/40"
                      >
                        {part.text}
                      </mark>
                    ) : (
                      <span key={i}>{part.text}</span>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="examples" className="mt-4">
          <div className="grid gap-3">
            {commonPatterns.map((ex) => (
              <Card
                key={ex.name}
                className="cursor-pointer transition hover:border-foreground/40"
                onClick={() => loadExample(ex.pattern, ex.flags, ex.sample)}
              >
                <CardHeader>
                  <CardTitle className="text-base">{ex.name}</CardTitle>
                  <CardDescription>{ex.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <code className="text-xs text-muted-foreground break-all">
                    {ex.pattern}
                  </code>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="cheatsheet" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-[100px_1fr] gap-y-3 text-sm">
                {cheatsheet.map((row) => (
                  <div key={row.token} className="contents">
                    <Badge variant="secondary" className="font-mono w-fit">
                      {row.token}
                    </Badge>
                    <span className="text-muted-foreground">{row.meaning}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
