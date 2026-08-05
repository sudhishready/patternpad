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