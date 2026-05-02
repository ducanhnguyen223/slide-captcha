<template>
  <div class="slider-captcha">
    <div class="captcha-card">
      <!-- Image area -->
      <div class="image-area" :style="{ width: `${imgWidth}px`, height: `${imgHeight}px` }">
        <canvas
          ref="bgCanvas"
          :width="imgWidth"
          :height="imgHeight"
          class="bg-canvas"
        />
        <canvas
          ref="pieceCanvas"
          :width="imgWidth"
          :height="imgHeight"
          class="piece-canvas"
          :style="{ clipPath: `inset(0 0 0 ${sliderLeft}px)` }"
        />

        <button class="btn-refresh" @click="reset" title="Làm mới">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>

        <div v-if="result" :class="['overlay-result', result.success ? 'success' : 'fail']">
          <span v-if="result.success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Xác thực thành công
          </span>
          <span v-else>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            {{ result.reason || 'Thử lại' }}
          </span>
        </div>
      </div>

      <!-- Slider track -->
      <div class="slider-track" :style="{ width: `${imgWidth}px` }">
        <div class="track-bg">
          <span class="track-hint">{{ result?.success ? '' : 'Kéo thanh trượt để ghép hình' }}</span>
          <div class="track-fill" :style="{ width: `${sliderLeft}px` }"></div>
        </div>

        <div
          class="slider-thumb"
          :style="{ left: `${sliderLeft}px` }"
          @mousedown="startDrag"
          @touchstart.prevent="startDrag"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const imgWidth = 340
const imgHeight = 190
const pieceSize = 44
const pieceRadius = 8

const bgCanvas = ref<HTMLCanvasElement>()
const pieceCanvas = ref<HTMLCanvasElement>()

const challengeId = ref('')
const gapX = ref(0)
const gapY = ref(0)
const sliderLeft = ref(0)
const imageSrc = ref('')

const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartLeft = ref(0)
const dragStartTime = ref(0)

const result = ref<{ success: boolean; reason?: string } | null>(null)
const loading = ref(true)

const maxSlider = computed(() => imgWidth - pieceSize)

async function createChallenge() {
  loading.value = true
  result.value = null
  sliderLeft.value = 0

  try {
    const res = await $fetch<any>('/api/captcha/create', { method: 'POST' })
    challengeId.value = res.challengeId
    imageSrc.value = res.imageUrl
    gapX.value = res.gapPosition || 0
    gapY.value = res.gapY || Math.floor(Math.random() * (imgHeight - pieceSize * 2) + pieceSize)

    await drawPuzzle()
  } catch (e) {
    console.error('Failed to create challenge:', e)
  } finally {
    loading.value = false
  }
}

async function drawPuzzle() {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = imageSrc.value

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => {
      // Retry with cache-bust
      img.src = imageSrc.value + '?t=' + Date.now()
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Image load failed'))
    }
  })

  // Draw background with gap hole
  const bg = bgCanvas.value!
  const bgCtx = bg.getContext('2d')!
  bgCtx.drawImage(img, 0, 0, imgWidth, imgHeight)

  // Cut gap hole
  bgCtx.save()
  bgCtx.fillStyle = 'rgba(0,0,0,0.5)'
  bgCtx.strokeStyle = 'rgba(255,255,255,0.8)'
  bgCtx.lineWidth = 2
  drawPuzzlePath(bgCtx, gapX.value, gapY.value)
  bgCtx.fill()
  bgCtx.stroke()
  bgCtx.restore()

  // Draw piece on piece canvas
  const pc = pieceCanvas.value!
  const pcCtx = pc.getContext('2d')!
  pcCtx.clearRect(0, 0, imgWidth, imgHeight)
  pcCtx.save()

  // Clip to puzzle shape
  drawPuzzlePath(pcCtx, gapX.value, gapY.value)
  pcCtx.clip()

  // Draw the piece at the gap position (it will be revealed by slider clipPath)
  pcCtx.drawImage(img, 0, 0, imgWidth, imgHeight)

  // Add border
  pcCtx.restore()
  pcCtx.save()
  pcCtx.strokeStyle = 'rgba(255,255,255,0.9)'
  pcCtx.lineWidth = 2
  pcCtx.shadowColor = 'rgba(0,0,0,0.4)'
  pcCtx.shadowBlur = 6
  pcCtx.shadowOffsetX = 2
  pcCtx.shadowOffsetY = 2
  drawPuzzlePath(pcCtx, gapX.value, gapY.value)
  pcCtx.stroke()
  pcCtx.restore()
}

function drawPuzzlePath(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const s = pieceSize
  const r = pieceRadius

  ctx.beginPath()
  // Top edge
  ctx.moveTo(x, y)
  ctx.lineTo(x + s * 0.4, y)
  // Top bump (tab)
  ctx.arc(x + s * 0.5, y, r, Math.PI, 0, false)
  ctx.lineTo(x + s, y)
  // Right edge
  ctx.lineTo(x + s, y + s * 0.4)
  // Right bump (tab)
  ctx.arc(x + s, y + s * 0.5, r, -Math.PI / 2, Math.PI / 2, false)
  ctx.lineTo(x + s, y + s)
  // Bottom edge
  ctx.lineTo(x, y + s)
  // Left edge
  ctx.lineTo(x, y)
  ctx.closePath()
}

function startDrag(e: MouseEvent | TouchEvent) {
  if (result.value?.success || loading.value) return

  isDragging.value = true
  dragStartX.value = 'touches' in e ? e.touches[0].clientX : e.clientX
  dragStartLeft.value = sliderLeft.value
  dragStartTime.value = Date.now()

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', endDrag)
  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('touchend', endDrag)
}

function onDrag(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return
  e.preventDefault()

  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const delta = clientX - dragStartX.value
  sliderLeft.value = Math.max(0, Math.min(maxSlider.value, dragStartLeft.value + delta))
}

async function endDrag() {
  if (!isDragging.value) return
  isDragging.value = false

  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', endDrag)

  const duration = Date.now() - dragStartTime.value

  try {
    const res = await $fetch<any>('/api/captcha/verify', {
      method: 'POST',
      body: {
        challengeId: challengeId.value,
        sliderPosition: sliderLeft.value,
        targetPosition: gapX.value,
        duration,
        moves: [{ from: 0, to: sliderLeft.value, duration }]
      }
    })
    result.value = res
    if (res.success) {
      sliderLeft.value = gapX.value
    } else {
      setTimeout(() => {
        sliderLeft.value = 0
      }, 800)
    }
  } catch (e: any) {
    result.value = { success: false, reason: e.data?.message || 'Lỗi xác thực' }
    setTimeout(() => {
      sliderLeft.value = 0
    }, 800)
  }
}

function reset() {
  sliderLeft.value = 0
  result.value = null
  createChallenge()
}

onMounted(() => {
  createChallenge()
})
</script>

<style scoped>
.slider-captcha {
  display: flex;
  justify-content: center;
}

.captcha-card {
  background: #1f2937;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  user-select: none;
}

.image-area {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #111827;
}

.bg-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.piece-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.btn-refresh {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  z-index: 5;
}
.btn-refresh:hover {
  background: rgba(0, 0, 0, 0.7);
}

.overlay-result {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 8px;
  animation: fadeIn 0.3s ease;
  z-index: 10;
}
.overlay-result.success {
  background: rgba(34, 197, 94, 0.85);
  color: #fff;
}
.overlay-result.fail {
  background: rgba(239, 68, 68, 0.85);
  color: #fff;
  animation: fadeIn 0.3s ease, shake 0.3s ease;
}

/* Slider track */
.slider-track {
  position: relative;
  height: 40px;
  margin-top: 12px;
}

.track-bg {
  position: absolute;
  inset: 0;
  background: #374151;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.track-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #4ade80);
  border-radius: 20px 0 0 20px;
  transition: none;
}

.track-hint {
  color: #9ca3af;
  font-size: 0.8rem;
  z-index: 1;
  pointer-events: none;
  white-space: nowrap;
}

.slider-thumb {
  position: absolute;
  top: 0;
  width: 40px;
  height: 40px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 5;
  transform: translateX(-50%);
  transition: none;
  color: #374151;
}
.slider-thumb:active {
  cursor: grabbing;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
</style>
