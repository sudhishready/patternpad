export type PatternExample = {
  name: string
  description: string
  pattern: string
  flags: string
  sample: string
}

export const commonPatterns: PatternExample[] = [
  {
    name: "Email",
    description: "matches a basic email address",
    pattern: "[\w.-]+@[\w.-]+\.\w+",
    flags: "g",
    sample: "contact me at jordan.dev@gmail.com or admin@site.io",
  },
  {
    name: "URL",
    description: "matches http and https links",
    pattern: "https?:\/\/[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#\[\]@!$&'()*+,;=.]*",
    flags: "g",
    sample: "check out https://nextjs.org and http://example.com/page",
  },
  {
    name: "Phone number",
    description: "matches us style phone numbers",
    pattern: "\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}",
    flags: "g",
    sample: "call me at 555-234-1234 or (555) 987-6543",
  },
  {
    name: "Hex color",
    description: "matches hex color codes",
    pattern: "#(?:[0-9a-fA-F]{3}){1,2}",
    flags: "g",
    sample: "brand colors are #1a1a1a and #FFF and #3b82f6",
  },
  {
    name: "Whitespace",
    description: "matches extra spaces",
    pattern: "\s+",
    flags: "g",
    sample: "too    many     spaces   here",
  },
  {
    name: "Digits only",
    description: "matches groups of numbers",
    pattern: "\d+",
    flags: "g",
    sample: "order 42 shipped 3 items on day 7",
  },
]

export type CheatRow = {
  token: string
  meaning: string
}

export const cheatsheet: CheatRow[] = [
  { token: ".", meaning: "any character except newline" },
  { token: "\d", meaning: "any digit 0-9" },
  { token: "\w", meaning: "word character a-z A-Z 0-9 _" },
  { token: "\s", meaning: "whitespace" },
  { token: "^", meaning: "start of string" },
  { token: "$", meaning: "end of string" },
  { token: "*", meaning: "0 or more" },
  { token: "+", meaning: "1 or more" },
  { token: "?", meaning: "0 or 1" },
  { token: "{n,m}", meaning: "between n and m times" },
  { token: "[abc]", meaning: "any of a, b or c" },
  { token: "(a|b)", meaning: "a or b" },
  { token: "(?:...)", meaning: "non capturing group" },
]
