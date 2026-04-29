// server/utils/validation.ts

export interface PathPoint {
  x: number
  y: number
  t: number
}

export interface MoveEvent {
  piece: number
  from: [number, number]
  to: [number, number]
  duration: number
  path: PathPoint[]
}

export interface ValidationResult {
  valid: boolean
  reason?: string
  score?: number
}

export function validateTiming(duration: number): ValidationResult {
  const MIN_DURATION = 200
  const MAX_DURATION = 30000

  if (duration < MIN_DURATION) {
    return { valid: false, reason: 'too_fast' }
  }

  if (duration > MAX_DURATION) {
    return { valid: false, reason: 'timeout' }
  }

  return { valid: true }
}

export function validatePathNaturalness(path: PathPoint[]): ValidationResult {
  if (!path || path.length < 3) {
    return { valid: false, reason: 'insufficient_path_data' }
  }

  const first = path[0]
  const last = path[path.length - 1]

  const directDistance = Math.sqrt(
    Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2)
  )

  let actualDistance = 0
  for (let i = 1; i < path.length; i++) {
    actualDistance += Math.sqrt(
      Math.pow(path[i].x - path[i-1].x, 2) + Math.pow(path[i].y - path[i-1].y, 2)
    )
  }

  const curvatureRatio = actualDistance / (directDistance || 1)
  const score = Math.min(curvatureRatio, 2) / 2

  if (score < 0.6) {
    return { valid: false, reason: 'unnatural_path', score }
  }

  let jitterCount = 0
  for (let i = 2; i < path.length; i++) {
    const prev = path[i-2]
    const curr = path[i-1]
    const next = path[i]

    const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x)
    const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x)
    const angleDiff = Math.abs(angle1 - angle2)

    if (angleDiff > 0.2) jitterCount++
  }

  const jitterScore = Math.min(jitterCount / path.length, 1)
  const finalScore = (score + jitterScore) / 2

  return { valid: finalScore > 0.5, score: finalScore }
}

export function verifySolution(initialState: number[][], finalState: number[][]): boolean {
  const solved = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 0]
  ]

  return JSON.stringify(finalState) === JSON.stringify(solved)
}
