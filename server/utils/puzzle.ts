// server/utils/puzzle.ts — Slider CAPTCHA (WeChat/QQ style)

export interface SliderPuzzleConfig {
  challengeId: string
  imageUrl: string
  gapPosition: number
  gapY: number
  solution: number
  createdAt: Date
  expiresAt: Date
}

export function generateSliderPuzzle(imageWidth = 340, imageHeight = 190): SliderPuzzleConfig {
  const challengeId = `chg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  const pieceSize = 44

  // Gap X: random between 30% and 70% of image width
  const minX = Math.floor(imageWidth * 0.3)
  const maxX = Math.floor(imageWidth * 0.7)
  const gapPosition = Math.floor(Math.random() * (maxX - minX) + minX)

  // Gap Y: random between 15% and 65% of image height
  const minY = Math.floor(imageHeight * 0.15)
  const maxY = Math.floor(imageHeight * 0.65)
  const gapY = Math.floor(Math.random() * (maxY - minY) + minY)

  const imageUrl = `https://picsum.photos/seed/${challengeId}/${imageWidth}/${imageHeight}`

  return {
    challengeId,
    imageUrl,
    gapPosition,
    gapY,
    solution: gapPosition,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  }
}
