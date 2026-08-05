export type RiskCheck = {
  isRisky: boolean
  reason: string | null
}

function hasNestedQuantifier(pattern: string): boolean {
  return /\([^()]*[+*][^()]*\)[+*]/.test(pattern)
}

function hasRepeatedWildcard(pattern: string): boolean {
  return /(\.\*){2,}/.test(pattern) || /(\.\+){2,}/.test(pattern)
}

function hasAmbiguousAlternation(pattern: string): boolean {
  return /\([^()]*\|[^()]*\)[+*]/.test(pattern)
}

export function checkRegexRisk(pattern: string): RiskCheck {
  if (hasNestedQuantifier(pattern)) {
    return {
      isRisky: true,
      reason: "nested quantifiers like (a+)+ can cause catastrophic backtracking",
    }
  }
  if (hasRepeatedWildcard(pattern)) {
    return {
      isRisky: true,
      reason: "repeated wildcards can get really slow on long strings",
    }
  }
  if (hasAmbiguousAlternation(pattern)) {
    return {
      isRisky: true,
      reason: "an alternation inside a repeated group can backtrack badly",
    }
  }
  return { isRisky: false, reason: null }
}