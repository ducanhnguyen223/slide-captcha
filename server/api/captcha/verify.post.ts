// server/api/captcha/verify.post.ts
import { Challenge } from '~/server/models/Challenge'
import { validateTiming, validatePathNaturalness, verifySolution } from '~/server/utils/validation'
import { nanoid } from 'nanoid'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { challengeId, solution, moves, totalDuration } = body

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

  const timingResult = validateTiming(totalDuration)
  if (!timingResult.valid) {
    challenge.attempts.push({
      timestamp: new Date(),
      duration: totalDuration,
      solved: false,
      moveCount: moves?.length || 0
    })
    await challenge.save()

    return { success: false, reason: timingResult.reason }
  }

  if (moves && moves.length > 0) {
    for (const move of moves) {
      if (move.path && move.path.length > 0) {
        const pathResult = validatePathNaturalness(move.path)
        if (!pathResult.valid) {
          challenge.attempts.push({
            timestamp: new Date(),
            duration: totalDuration,
            solved: false,
            moveCount: moves.length
          })
          await challenge.save()

          return { success: false, reason: pathResult.reason }
        }
      }
    }
  }

  const isCorrect = verifySolution(challenge.initialState, solution)

  if (!isCorrect) {
    challenge.attempts.push({
      timestamp: new Date(),
      duration: totalDuration,
      solved: false,
      moveCount: moves?.length || 0
    })
    await challenge.save()

    return { success: false, reason: 'invalid_solution' }
  }

  challenge.solved = true
  challenge.attempts.push({
    timestamp: new Date(),
    duration: totalDuration,
    solved: true,
    moveCount: moves?.length || 0
  })
  await challenge.save()

  const token = `csc_${nanoid(24)}`

  return { success: true, token, solvedIn: totalDuration }
})
