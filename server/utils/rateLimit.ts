// server/utils/rateLimit.ts

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitRecord>()

const WINDOW_MS = 60 * 1000
const MAX_REQUESTS = 10

export function checkRateLimit(ip: string): boolean {
  const now = Date.now()

  let record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + WINDOW_MS }
    rateLimitMap.set(ip, record)
    return true
  }

  if (record.count >= MAX_REQUESTS) {
    return false
  }

  record.count++
  return true
}

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [ip, record] of rateLimitMap) {
      if (now > record.resetTime) {
        rateLimitMap.delete(ip)
      }
    }
  }, 600000)
}
