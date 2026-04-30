<template>
  <div class="slider-captcha">
    <div class="captcha-wrapper">
      <!-- Background image -->
      <div
        class="image-container"
        :style="{ width: `${width}px`, height: `${height}px` }"
      >
        <div
          class="background-image"
          :style="{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: `${width}px ${height}px`
          }"
        ></div>

        <!-- Gap overlay (dark area) -->
        <div
          class="gap-overlay"
          :style="{
            left: `${gapPosition}px`,
            width: `${pieceWidth}px`,
            height: `${height}px`
          }"
        ></div>

        <!-- Slider handle -->
        <div
          class="slider-handle"
          :style="{
            left: `${sliderPosition}px`,
            width: `${handleWidth}px`,
            height: `${height}px`
          }"
          @mousedown="startDrag"
          @touchstart.prevent="startDrag"
        >
          <div class="handle-icon">→</div>
        </div>

        <!-- Track lines -->
        <div class="track-line" :style="{ left: `${gapPosition}px`, width: `${pieceWidth}px` }"></div>
      </div>

      <p class="hint">Kéo thanh trượt sang phải để ghép hình</p>

      <div v-if="result" :class="['result', result.success ? 'success' : 'error']">
        <span v-if="result.success">✓ Xác thực thành công!</span>
        <span v-else>✗ {{ result.reason || 'Thử lại' }}</span>
      </div>
    </div>

    <button v-if="result && !result.success" @click="reset" class="btn-reset">
      Thử lại
    </button>
  </div>
</template>

<script setup lang="ts">
const width = ref(320)
const height = ref(160)
const pieceWidth = ref(40)
const handleWidth = ref(44)
const gapPosition = ref(0)
const sliderPosition = ref(0)
const imageUrl = ref('')
const challengeId = ref('')

const isDragging = ref(false)
const startX = ref(0)
const startSliderX = ref(0)
const dragStartTime = ref(0)

const result = ref<{ success: boolean; reason?: string } | null>(null)
const verifying = ref(false)

const maxSlider = computed(() => width.value - handleWidth.value)

async function createChallenge() {
  try {
    const res = await $fetch<any>('/api/captcha/create', { method: 'POST' })
    challengeId.value = res.challengeId
    imageUrl.value = res.imageUrl || `https://picsum.photos/seed/${Date.now()}/320/160`

    // Random gap between 30% and 70%
    const minGap = Math.floor(width.value * 0.3)
    const maxGap = Math.floor(width.value * 0.7) - pieceWidth.value
    gapPosition.value = Math.floor(Math.random() * (maxGap - minGap) + minGap)

    sliderPosition.value = 0
    result.value = null
  } catch (e) {
    console.error('Failed to create challenge:', e)
  }
}

function startDrag(e: MouseEvent | TouchEvent) {
  if (result.value?.success) return

  isDragging.value = true
  startX.value = 'touches' in e ? e.touches[0].clientX : e.clientX
  startSliderX.value = sliderPosition.value
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
  const delta = clientX - startX.value
  const newPos = Math.max(0, Math.min(maxSlider.value, startSliderX.value + delta))

  sliderPosition.value = newPos
}

async function endDrag() {
  if (!isDragging.value) return
  isDragging.value = false

  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', endDrag)

  const duration = Date.now() - dragStartTime.value
  const diff = Math.abs(sliderPosition.value - gapPosition.value)

  // Anti-cheat: too fast
  if (duration < 200) {
    result.value = { success: false, reason: 'Quá nhanh, thử lại' }
    sliderPosition.value = 0
    return
  }

  // Check if close enough (±5px)
  if (diff <= 5) {
    sliderPosition.value = gapPosition.value
    await verify(true, duration)
  } else {
    result.value = { success: false, reason: 'Chưa khớp, thử lại' }
    sliderPosition.value = 0
  }
}

async function verify(success: boolean, duration: number) {
  verifying.value = true

  try {
    const res = await $fetch<any>('/api/captcha/verify', {
      method: 'POST',
      body: {
        challengeId: challengeId.value,
        sliderPosition: sliderPosition.value,
        targetPosition: gapPosition.value,
        duration: duration,
        moves: [{ from: 0, to: sliderPosition.value, duration }]
      }
    })
    result.value = res
  } catch (e: any) {
    result.value = { success: false, reason: e.data?.message || 'Lỗi xác thực' }
  } finally {
    verifying.value = false
  }
}

function reset() {
  sliderPosition.value = 0
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
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.captcha-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.image-container {
  position: relative;
  background: #1a1a2e;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.gap-overlay {
  position: absolute;
  top: 0;
  background: #1a1a2e;
  border-left: 2px solid #4ade80;
  border-right: 2px solid #4ade80;
  box-shadow: 0 0 15px rgba(74, 222, 128, 0.3);
}

.slider-handle {
  position: absolute;
  top: 0;
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  border-radius: 0 4px 4px 0;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
  z-index: 10;
  transition: transform 0.05s ease-out;
}

.slider-handle:active {
  cursor: grabbing;
}

.handle-icon {
  color: #1a1a2e;
  font-size: 1.25rem;
  font-weight: bold;
}

.track-line {
  position: absolute;
  top: 0;
  height: 100%;
  border: 2px dashed rgba(74, 222, 128, 0.5);
  border-radius: 4px;
  pointer-events: none;
}

.hint {
  color: #9ca3af;
  font-size: 0.875rem;
  text-align: center;
  margin: 0;
}

.result {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  text-align: center;
  animation: fadeIn 0.3s ease;
}

.result.success {
  background: rgba(74, 222, 128, 0.15);
  color: #4ade80;
  border: 1px solid #4ade80;
}

.result.error {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid #ef4444;
  animation: shake 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.btn-reset {
  padding: 0.5rem 1.5rem;
  background: #374151;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-reset:hover {
  background: #4b5563;
}
</style>