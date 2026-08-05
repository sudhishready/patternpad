export type SharedState = {
  pattern: string
  flags: string
  testString: string
}
export function buildShareUrl(state: SharedState): string {
  const params = new URLSearchParams()
  params.set("p", state.pattern)
  params.set("f", state.flags)
  params.set("t", state.testString)
  const url = new URL(window.location.href)
  url.search = params.toString()
  return url.toString()
}

export function readShareParams(): SharedState | null {
  const params = new URLSearchParams(window.location.search)
  const pattern = params.get("p")
  if (pattern === null) return null
  return {
    pattern,
    flags: params.get("f") ?? "",
    testString: params.get("t") ?? "",
  }
}