export type ExplainToken = {
  token: string
  meaning: string
}

function readCharClass(pattern: string, start: number) {
  let i = start + 1
  let content = "["
  if (pattern[i] === "^") {
    content += "^"
    i++
  }
  while (i < pattern.length && pattern[i] !== "]") {
    if (pattern[i] === "\\" && i + 1 < pattern.length) {
      content += pattern[i] + pattern[i + 1]
      i += 2
    } else {
      content += pattern[i]
      i++
    }
  }
  content += "]"
  i++
  return { token: content, end: i }
}

function readGroup(pattern: string, start: number) {
  let depth = 0
  let i = start
  let content = ""
  do {
    if (pattern[i] === "\\" && i + 1 < pattern.length) {
      content += pattern[i] + pattern[i + 1]
      i += 2
      continue
    }
    if (pattern[i] === "(") depth++
    if (pattern[i] === ")") depth--
    content += pattern[i]
    i++
  } while (i < pattern.length && depth > 0)
  return { token: content, end: i }
}

function readQuantifier(pattern: string, start: number) {
  let i = start
  if (pattern[i] === "{") {
    let content = "{"
    i++
    while (i < pattern.length && pattern[i] !== "}") {
      content += pattern[i]
      i++
    }
    content += "}"
    i++
    if (pattern[i] === "?") {
      content += "?"
      i++
    }
    return { token: content, end: i }
  }
  let content = pattern[i]
  i++
  if (pattern[i] === "?") {
    content += "?"
    i++
  }
  return { token: content, end: i }
}

function meaningForEscape(code: string) {
  switch (code) {
    case "d":
      return "any digit 0-9"
    case "D":
      return "any non digit"
    case "w":
      return "a word character"
    case "W":
      return "any non word character"
    case "s":
      return "whitespace"
    case "S":
      return "non whitespace"
    case "b":
      return "word boundary"
    case "B":
      return "non word boundary"
    case "n":
      return "newline"
    case "t":
      return "tab"
    default:
      return `literal "${code}"`
  }
}

function meaningForQuantifier(token: string) {
  const lazy = token.endsWith("?") && token !== "?"
  const base = lazy ? token.slice(0, -1) : token
  let text = ""
  if (base === "*") text = "0 or more times"
  else if (base === "+") text = "1 or more times"
  else if (base === "?") text = "0 or 1 time"
  else if (base.startsWith("{")) {
    const inner = base.slice(1, -1)
    if (inner.includes(",")) {
      const parts = inner.split(",")
      const min = parts[0]
      const max = parts[1]
      text = max ? `between ${min} and ${max} times` : `${min} or more times`
    } else {
      text = `exactly ${inner} times`
    }
  }
  return lazy ? `${text}, as few as possible` : text
}

function meaningForGroup(token: string) {
  if (token.startsWith("(?:")) return "group, not captured"
  if (token.startsWith("(?=")) return "lookahead, must be followed by this"
  if (token.startsWith("(?!")) return "negative lookahead, must not be followed by this"
  if (token.startsWith("(?<=")) return "lookbehind, must be preceded by this"
  if (token.startsWith("(?<!")) return "negative lookbehind, must not be preceded by this"
  if (token.startsWith("(?<")) return "named capture group"
  return "capture group"
}

export function explainPattern(pattern: string): ExplainToken[] {
  const tokens: ExplainToken[] = []
  let i = 0
  while (i < pattern.length) {
    const char = pattern[i]
    if (char === "\\") {
      const next = pattern[i + 1] ?? ""
      tokens.push({ token: `\\${next}`, meaning: meaningForEscape(next) })
      i += 2
      continue
    }

    if (char === "[") {
      const result = readCharClass(pattern, i)
      tokens.push({ token: result.token, meaning: `any one character from ${result.token}` })
      i = result.end
      continue
    }

    if (char === "(") {
      const result = readGroup(pattern, i)
      tokens.push({ token: result.token, meaning: meaningForGroup(result.token) })
      i = result.end
      continue
    }

    if (char === "^") {
      tokens.push({ token: "^", meaning: "start of string" })
      i++
      continue
    }

    if (char === "$") {
      tokens.push({ token: "$", meaning: "end of string" })
      i++
      continue
    }

    if (char === ".") {
      tokens.push({ token: ".", meaning: "any character except newline" })
      i++
      continue
    }

    if (char === "|") {
      tokens.push({ token: "|", meaning: "or" })
      i++
      continue
    }

    if (char === "*" || char === "+" || char === "?" || char === "{") {
      const result = readQuantifier(pattern, i)
      tokens.push({ token: result.token, meaning: meaningForQuantifier(result.token) })
      i = result.end
      continue
    }

    tokens.push({ token: char, meaning: `literal "${char}"` })
    i++
  }
  return tokens
}