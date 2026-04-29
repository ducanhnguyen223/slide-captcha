// server/utils/puzzle.ts

const SOLVED_STATE = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 0]
]

export interface PuzzleConfig {
  challengeId: string
  gridSize: number
  imageUrl: string
  initialState: number[][]
  solution: number[][]
  createdAt: Date
  expiresAt: Date
}

function countInversions(state: number[][]): number {
  const flat = state.flat().filter(n => n !== 0)
  let inversions = 0

  for (let i = 0; i < flat.length; i++) {
    for (let j = i + 1; j < flat.length; j++) {
      if (flat[i] > flat[j]) inversions++
    }
  }

  return inversions
}

export function isSolvable(state: number[][]): boolean {
  return countInversions(state) % 2 === 0
}

function getEmptyPosition(state: number[][]): { row: number; col: number } {
  for (let row = 0; row < state.length; row++) {
    for (let col = 0; col < state[row].length; col++) {
      if (state[row][col] === 0) return { row, col }
    }
  }
  throw new Error('No empty position found')
}

export function applyMove(state: number[][], fromRow: number, fromCol: number): number[][] {
  const newState = state.map(row => [...row])
  const empty = getEmptyPosition(state)

  const rowDiff = Math.abs(fromRow - empty.row)
  const colDiff = Math.abs(fromCol - empty.col)

  if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
    newState[empty.row][empty.col] = newState[fromRow][fromCol]
    newState[fromRow][fromCol] = 0
  }

  return newState
}

function deepClone<T>(arr: T[][]): T[][] {
  return arr.map(row => [...row])
}

export function generatePuzzle(gridSize = 3): PuzzleConfig {
  let state = deepClone(SOLVED_STATE)
  const challengeId = `chg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  const moveCount = 15 + Math.floor(Math.random() * 10)
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1]
  ]

  for (let i = 0; i < moveCount; i++) {
    const empty = getEmptyPosition(state)
    const validMoves = directions
      .map(([dRow, dCol]) => ({ row: empty.row + dRow, col: empty.col + dCol }))
      .filter(pos => pos.row >= 0 && pos.row < gridSize && pos.col >= 0 && pos.col < gridSize)

    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)]
    state = applyMove(state, randomMove.row, randomMove.col)
  }

  const imageUrl = `https://picsum.photos/seed/${challengeId}/300/300`

  return {
    challengeId,
    gridSize,
    imageUrl,
    initialState: state,
    solution: SOLVED_STATE,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  }
}
