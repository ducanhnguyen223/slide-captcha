import { Challenge } from '~/server/models/Challenge'
import { checkRateLimit } from '~/server/utils/rateLimit'
import { ensureConnection } from '~/server/plugins/mongodb'
import { nanoid } from 'nanoid'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { challengeId, sliderPosition, targetPosition, duration } = body

  const ip = getHeader(event, 'x-forwarded-for') ||
    getHeader(event, 'x-real-ip') ||
    'unknown'

  if (!checkRateLimit(ip)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests'
    })
  }

  const connected = await ensureConnection()
  if (!connected) {
    throw createError({ statusCode: 503, statusMessage: 'Database unavailable' })
  }

  const challenge = await Challenge.findOne({ challengeId })

  if (!challenge) {
    throw createError({ statusCode: 404, statusMessage: 'Challenge not found' })
  }

  if (challenge.solved) {
    throw createError({ statusCode: 400, statusMessage: 'Challenge already solved' })
  }

  if (new Date() > challenge.expiresAt) {
    throw createError({ statusCode: 410, statusMessage: 'Challenge expired' })
  }

  if (duration < 200) {
    challenge.attempts.push({
      timestamp: new Date(),
      sliderPosition: sliderPosition || 0,
      duration: duration || 0,
      solved: false
    })
    await challenge.save()
    return { success: false, reason: 'Quá nhanh, thử lại' }
  }

  if (duration > 30000) {
    challenge.attempts.push({
      timestamp: new Date(),
      sliderPosition: sliderPosition || 0,
      duration: duration || 0,
      solved: false
    })
    await challenge.save()
    return { success: false, reason: 'Quá chậm, thử lại' }
  }

  const target = challenge.gapPosition || challenge.solution
  const diff = Math.abs((sliderPosition || 0) - target)

  if (diff > 5) {
    challenge.attempts.push({
      timestamp: new Date(),
      sliderPosition: sliderPosition || 0,
      duration: duration || 0,
      solved: false
    })
    await challenge.save()
    return { success: false, reason: 'Chưa khớp, thử lại' }
  }

  challenge.solved = true
  challenge.attempts.push({
    timestamp: new Date(),
    sliderPosition: sliderPosition || 0,
    duration: duration || 0,
    solved: true
  })
  await challenge.save()

  const token = `csc_${nanoid(24)}`

  return { success: true, token }
})
