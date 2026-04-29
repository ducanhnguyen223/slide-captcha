<template>
  <div class="captcha-container">
    <div class="puzzle-grid">
      <div v-for="(row, rowIndex) in currentGrid" :key="rowIndex" class="puzzle-row">
        <div
          v-for="(cell, colIndex) in row"
          :key="`${rowIndex}-${colIndex}`"
          class="puzzle-cell"
          :class="{ 'empty': cell === 0 }"
          :style="getCellStyle(rowIndex, colIndex)"
          @mousedown="startDrag($event, rowIndex, colIndex, cell)"
          @touchstart.prevent="startDrag($event, rowIndex, colIndex, cell)"
        >
        </div>
      </div>
    </div>

    <div class="controls">
      <button @click="verify" :disabled="!canVerify || verifying" class="btn-verify">
        {{ verifying ? 'Verifying...' : 'Verify' }}
      </button>
      <button @click="resetPuzzle" class="btn-reset">New Puzzle</button>
    </div>

    <div v-if="result" :class="['result', result.success ? 'success' : 'error']">
      <p v-if="result.success">✓ Verified! Token: {{ result.token?.substring(0, 20) }}...</p>
      <p v-else>✗ {{ result.reason || 'Verification failed' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const challengeId = ref('')
const imageUrl = ref('')
const currentGrid = ref<number[][]>([])
const solutionGrid = [[1, 2, 3], [4, 5, 6], [7, 8, 0]]

const isDragging = ref(false)
const draggingPiece = ref<{ row: number; col: number; value: number } | null>(null)
const dragStartPos = ref({ x: 0, y: 0 })
const moves = ref<any[]>([])
const totalStartTime = ref(0)
const verifying = ref(false)
const result = ref<{ success: boolean; token?: string; reason?: string } | null>(null)

const GRID_SIZE = 300
const CELL_SIZE = GRID_SIZE / 3

function getCellStyle(row: number, col: number) {
  return {
    width: `${CELL_SIZE}px`,
    height: `${CELL_SIZE}px`,
    left: `${col * CELL_SIZE}px`,
    top: `${row * CELL_SIZE}px`,
    backgroundImage: imageUrl.value ? `url(${imageUrl.value})` : 'none',
    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
    backgroundPosition: `-${col * CELL_SIZE}px -${row * CELL_SIZE}px`
  }
}

function getEmptyPosition(grid: number[][]) {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (grid[r][c] === 0) return { row: r, col: c }
    }
  }
  return { row: 2, col: 2 }
}

function canMoveTo(row: number, col: number): boolean {
  const empty = getEmptyPosition(currentGrid.value)
  const rowDiff = Math.abs(row - empty.row)
  const colDiff = Math.abs(col - empty.col)
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
}

function startDrag(event: MouseEvent | TouchEvent, row: number, col: number, cell: number) {
  if (cell === 0) return
  if (!canMoveTo(row, col)) return

  isDragging.value = true
  draggingPiece.value = { row, col, value: cell }

  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
  dragStartPos.value = { x: clientX, y: clientY }

  if (moves.value.length === 0) totalStartTime.value = Date.now()

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', endDrag)
  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('touchend', endDrag)
}

function onDrag(event: MouseEvent | TouchEvent) {
  if (!isDragging.value) return
  event.preventDefault()
}

function endDrag(event: MouseEvent | TouchEvent) {
  if (!isDragging.value || !draggingPiece.value) {
    cleanupDrag()
    return
  }

  const clientX = 'changedTouches' in event ? event.changedTouches[0].clientX : event.clientX
  const clientY = 'changedTouches' in event ? event.changedTouches[0].clientY : event.clientY

  const deltaX = clientX - dragStartPos.value.x
  const deltaY = clientY - dragStartPos.value.y

  if (Math.abs(deltaX) > 20 || Math.abs(deltaY) > 20) {
    const empty = getEmptyPosition(currentGrid.value)
    const { row, col, value } = draggingPiece.value

    const newGrid = currentGrid.value.map(r => [...r])
    newGrid[empty.row][empty.col] = value
    newGrid[row][col] = 0
    currentGrid.value = newGrid

    moves.value.push({
      piece: value,
      from: [row, col],
      to: [empty.row, empty.col],
      duration: 150,
      path: []
    })
  }

  cleanupDrag()
}

function cleanupDrag() {
  isDragging.value = false
  draggingPiece.value = null
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', endDrag)
}

const canVerify = computed(() => {
  return JSON.stringify(currentGrid.value) === JSON.stringify(solutionGrid)
})

async function createChallenge() {
  try {
    const res = await $fetch<any>('/api/captcha/create', { method: 'POST' })
    challengeId.value = res.challengeId
    imageUrl.value = res.imageUrl
    currentGrid.value = res.grid
    moves.value = []
    totalStartTime.value = 0
    result.value = null
  } catch (e) {
    console.error('Failed to create challenge:', e)
  }
}

async function verify() {
  if (!canVerify.value) return
  verifying.value = true
  result.value = null

  try {
    const res = await $fetch<any>('/api/captcha/verify', {
      method: 'POST',
      body: {
        challengeId: challengeId.value,
        solution: currentGrid.value,
        moves: moves.value,
        totalDuration: Date.now() - totalStartTime.value
      }
    })
    result.value = res
  } catch (e: any) {
    result.value = { success: false, reason: e.message || 'Verification failed' }
  } finally {
    verifying.value = false
  }
}

function resetPuzzle() {
  createChallenge()
}

onMounted(() => {
  createChallenge()
})
</script>

<style scoped>
.captcha-container { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
.puzzle-grid { position: relative; width: 300px; height: 300px; background: #374151; border-radius: 8px; overflow: hidden; }
.puzzle-row { display: flex; }
.puzzle-cell { position: absolute; background: #4b5563; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: transform 0.15s ease-out; }
.puzzle-cell.empty { background: transparent; cursor: default; }
.puzzle-cell:not(.empty):hover { border-color: #4ade80; }
.controls { display: flex; gap: 1rem; }
.btn-verify, .btn-reset { padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-verify { background: #4ade80; color: #1a1a2e; }
.btn-verify:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-reset { background: #374151; color: #fff; }
.result { padding: 1rem 1.5rem; border-radius: 8px; font-weight: 500; }
.result.success { background: rgba(74,222,128,0.2); color: #4ade80; border: 1px solid #4ade80; }
.result.error { background: rgba(239,68,68,0.2); color: #ef4444; border: 1px solid #ef4444; }
</style>
