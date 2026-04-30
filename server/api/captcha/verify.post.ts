import { Challenge } from '~/server/models/Challenge'
import { checkRateLimit } from '~/server/utils/rateLimit'
import { nanoid } from 'nanoid'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { challengeId, sliderPosition, targetPosition, duration, moves } = body

  const ip = getHeader(event, 'x-forwarded-for') ||
    getHeader(event, 'x-real-ip') ||
    'unknown'

  if (!checkRateLimit(ip)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests'
    })
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
    return { success: false, reason: 'too_fast' }
  }

  if (duration > 30000) {
    challenge.attempts.push({
      timestamp: new Date(),
      sliderPosition: sliderPosition || 0,
      duration: duration || 0,
      solved: false
    })
    await challenge.save()
    return { success: false, reason: 'timeout' }
  }

  const target = targetPosition || challenge.gapPosition || challenge.solution
  const diff = Math.abs((sliderPosition || 0) - target)

  if (diff > 5) {
    challenge.attempts.push({
      timestamp: new Date(),
      sliderPosition: sliderPosition || 0,
      duration: duration || 0,
      solved: false
    })
    await challenge.save()
    return { success: false, reason: 'position_mismatch' }
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
