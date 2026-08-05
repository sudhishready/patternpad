"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex items-center gap-2">
      <Switch
        id="dark-mode"
        checked={theme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
      <Label htmlFor="dark-mode">dark mode</Label>
    </div>
  )
}