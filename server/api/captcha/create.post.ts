// server/api/captcha/create.post.ts
import { Challenge } from '~/server/models/Challenge'
import { generatePuzzle } from '~/server/utils/puzzle'
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

  const puzzle = generatePuzzle()

  const challenge = new Challenge({
    challengeId: puzzle.challengeId,
    imageUrl: puzzle.imageUrl,
    gridSize: puzzle.gridSize,
    initialState: puzzle.initialState,
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
    grid: puzzle.initialState,
    expiresAt: puzzle.expiresAt.toISOString()
  }
})
