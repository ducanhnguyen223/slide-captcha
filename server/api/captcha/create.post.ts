import { Challenge } from '~/server/models/Challenge'
import { generateSliderPuzzle } from '~/server/utils/puzzle'
import { checkRateLimit } from '~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  const ip = getHeader(event, 'x-forwarded-for') ||
    getHeader(event, 'x-real-ip') ||
    'unknown'

  if (!checkRateLimit(ip)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests'
    })
  }

  const puzzle = generateSliderPuzzle()

  const challenge = new Challenge({
    challengeId: puzzle.challengeId,
    imageUrl: puzzle.imageUrl,
    gapPosition: puzzle.gapPosition,
    gapY: puzzle.gapY,
    solution: puzzle.solution,
    createdAt: puzzle.createdAt,
    expiresAt: puzzle.expiresAt,
    solved: false,
    attempts: []
  })

  await challenge.save()

  return {
    challengeId: puzzle.challengeId,
    imageUrl: puzzle.imageUrl,
    gapPosition: puzzle.gapPosition,
    gapY: puzzle.gapY,
    expiresAt: puzzle.expiresAt.toISOString()
  }
})
