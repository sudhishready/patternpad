"use client"

import { useEffect, useMemo, useState } from "react"
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
import { Button } from "@/components/ui/button"
import { explainPattern } from "@/lib/regex-explain"
import { usePatternHistory } from "@/lib/use-pattern-history"
import { ThemeToggle } from "@/components/theme-toggle"
import { checkRegexRisk } from "@/lib/regex-risk"
import { buildShareUrl, readShareParams } from "@/lib/share-link"

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
  const [replacement, setReplacement] = useState("[redacted]")
  const [copyStatus, setCopyStatus] = useState("copy")
  const [shareStatus, setShareStatus] = useState("share link")
  const [importText, setImportText] = useState("")
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [batchInput, setBatchInput] = useState("")
  useEffect(() => {
    const shared = readShareParams()
    if (!shared) return
    setPattern(shared.pattern)
    setTestString(shared.testString)
    setFlags({
      g: shared.flags.includes("g"),
      i: shared.flags.includes("i"),
      m: shared.flags.includes("m"),
      s: shared.flags.includes("s"),
    })
  }, [])
    
const { history, addEntry, clearHistory, exportHistory, importHistory } = usePatternHistory()

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
  const risk = useMemo(() => checkRegexRisk(pattern), [pattern])
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
  const groups = useMemo(() => {
    if (matches.length === 0) return []
    const first = matches[0]
    const rows: { name: string; value: string }[] = []
    for (let i = 1; i < first.length; i++) {
      rows.push({ name: `group ${i}`, value: first[i] ?? "" })
    }
    if (first.groups) {
      for (const key of Object.keys(first.groups)) {
        rows.push({ name: key, value: first.groups[key] ?? "" })
      }
    }
    return rows
  }, [matches])
  const explanation = useMemo(() => {
    if (!pattern) return []
    return explainPattern(pattern)
  }, [pattern])
  const replaced = useMemo(() => {
    if (!regex) return testString
    try {
      return testString.replace(regex, replacement)
    } catch {
      return testString
    }
  }, [regex, testString, replacement])
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
  function loadHistoryEntry(p: string, f: string) {
    setPattern(p)
    setFlags({
      g: f.includes("g"),
      i: f.includes("i"),
      m: f.includes("m"),
      s: f.includes("s"),
    })
  }
  async function copyPattern() {
    await navigator.clipboard.writeText(`/${pattern}/${flagString}`)
    setCopyStatus("copied!")
    setTimeout(() => setCopyStatus("copy"), 1500)
  }
  async function shareLink() {
    const url = buildShareUrl({ pattern, flags: flagString, testString })
    await navigator.clipboard.writeText(url)
    setShareStatus("link copied!")
    setTimeout(() => setShareStatus("share link"), 1500)
  }
  async function exportToClipboard() {
    await navigator.clipboard.writeText(exportHistory())
    setImportMessage("copied history to clipboard")
    setTimeout(() => setImportMessage(null), 1500)
  }
  function handleImport() {
    const ok = importHistory(importText)
    setImportMessage(ok ? "imported!" : "that didn't look right")
    if (ok) setImportText("")
  }
  const batchResults = useMemo(() => {
    const lines = batchInput.split("\n").filter((l) => l.trim().length > 0)
    return lines.map((line) => {
      try {
        const re = new RegExp(pattern, flagString.replace("g", ""))
        return { line, pass: re.test(line) }
      } catch {
        return { line, pass: false }
      }
    })
  }, [batchInput, pattern, flagString])
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">patternpad</h1>
          <p className="text-muted-foreground mt-1">
            test your regex live, no more guessing in the console
          </p>
        </div>
        <ThemeToggle />
      </div>
      <Tabs defaultValue="tester">
        <TabsList>
          <TabsTrigger value="tester">tester</TabsTrigger>
        <TabsTrigger value="replace">replace</TabsTrigger>
          <TabsTrigger value="batch">batch</TabsTrigger>
          <TabsTrigger value="examples">examples</TabsTrigger>
          <TabsTrigger value="cheatsheet">cheatsheet</TabsTrigger>
          <TabsTrigger value="history">history</TabsTrigger>
        </TabsList>
        <TabsContent value="tester" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>your pattern</CardTitle>
              <CardDescription>
      {risk.isRisky && (
        <p className="text-amber-500 text-xs mt-1">heads up, {risk.reason}</p>
      )}
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
                <Button
                  variant="secondary"
                  onClick={() => addEntry(pattern, flagString)}
                >
                  save
                </Button>
        <Button variant="outline" onClick={copyPattern}>
          {copyStatus}
        </Button>
        <Button variant="outline" onClick={shareLink}>
          {shareStatus}
        </Button>
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
      {groups.length > 0 && (
        <div>
          <Label className="mb-2 block">capture groups</Label>
          <div className="grid grid-cols-[100px_1fr] gap-y-2 text-sm">
            {groups.map((g, i) => (
              <div key={i} className="contents">
                <Badge variant="secondary" className="font-mono w-fit">
                  {g.name}
                </Badge>
                <span className="text-muted-foreground font-mono">
                  {g.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
              {explanation.length > 0 && (
                <div>
                  <Label className="mb-2 block">what this means</Label>
                  <div className="grid grid-cols-[100px_1fr] gap-y-2 text-sm">
                    {explanation.map((tok, i) => (
                      <div key={i} className="contents">
                        <Badge variant="secondary" className="font-mono w-fit">
                          {tok.token}
                        </Badge>
                        <span className="text-muted-foreground">{tok.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      <TabsContent value="replace" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>find and replace</CardTitle>
            <CardDescription>
              uses the pattern and test string from the tester tab
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block">replacement</Label>
              <Input
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
                placeholder="replacement text, $1 works for groups"
                className="font-mono"
              />
            </div>
            <div>
              <Label className="mb-2 block">result</Label>
              <div className="rounded-md border bg-muted/30 p-3 font-mono text-sm whitespace-pre-wrap break-words">
                {replaced}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
        <TabsContent value="batch" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>batch test</CardTitle>
              <CardDescription>
                test the pattern against a bunch of lines at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block">test lines</Label>
                <Textarea
                  value={batchInput}
                  onChange={(e) => setBatchInput(e.target.value)}
                  placeholder="one test case per line"
                  className="font-mono min-h-32"
                />
              </div>
              <p className="text-muted-foreground text-sm">
                {batchResults.filter((r) => r.pass).length} / {batchResults.length} lines matched
              </p>
              <div className="grid gap-2">
                {batchResults.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-md border p-2 font-mono text-sm">
                    <span className={r.pass ? "text-green-500" : "text-red-500"}>
                      {r.pass ? "pass" : "fail"}
                    </span>
                    <span className="truncate">{r.line}</span>
                  </div>
                ))}
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
        <TabsContent value="history" className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              patterns you saved, stored in your browser
            </p>
            {history.length > 0 && (
          <>
              <Button variant="ghost" size="sm" onClick={clearHistory}>
                clear all
              </Button>
          <Button variant="ghost" size="sm" onClick={exportToClipboard}>
            export
          </Button>
          </>
            )}
          </div>
        <div className="mb-4 flex flex-col gap-2">
          <Textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="paste exported history json here"
            className="font-mono text-xs"
          />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleImport}>
              import
            </Button>
            {importMessage && (
              <span className="text-xs text-muted-foreground">{importMessage}</span>
            )}
          </div>
        </div>
        {history.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            nothing saved yet, hit save next to a pattern to keep it here
          </p>
        ) : (
          <div className="grid gap-3">
              {history.map((entry) => (
                <Card
                  key={entry.savedAt}
                  className="cursor-pointer transition hover:border-foreground/40"
                  onClick={() => loadHistoryEntry(entry.pattern, entry.flags)}
                >
                  <CardHeader>
                    <CardTitle className="font-mono text-base">
                      /{entry.pattern}/{entry.flags}
                    </CardTitle>
                    <CardDescription>
                      {new Date(entry.savedAt).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}