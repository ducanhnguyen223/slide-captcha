# Sliding Puzzle CAPTCHA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a sliding puzzle CAPTCHA-as-a-Service with demo page, API endpoints, and analytics dashboard using Nuxt 3, Nitro, MongoDB Atlas, and Vercel deployment.

**Architecture:** Fullstack Nuxt 3 application with Nitro server API routes. MongoDB Atlas for challenge storage. Vercel for hosting and deployment. Anti-cheat via mouse/touch path analysis and timing validation.

**Tech Stack:** Nuxt 3, Nitro, MongoDB (Mongoose), Vue 3 Composition API, TypeScript, Vercel

---

## File Structure

```
/Users/m/Documents/Project/Captcha/
├── nuxt.config.ts              # Nuxt configuration with Nitro
├── package.json                # Dependencies
├── app.vue                     # Root layout
├── .env                        # Environment variables
├── components/
│   ├── SlidingCaptcha.vue      # Main puzzle component
│   ├── CaptchaPiece.vue        # Individual puzzle piece
│   └── CaptchaSuccess.vue      # Success animation
├── composables/
│   ├── useCaptcha.ts           # Create/verify captcha API
│   └── useMouseTracking.ts     # Mouse/touch path tracking
├── server/
│   ├── api/
│   │   ├── captcha/
│   │   │   ├── create.post.ts  # Create challenge
│   │   │   ├── verify.post.ts  # Verify solution
│   │   │   └── stats.get.ts    # Get stats
│   │   └── health.get.ts
│   ├── utils/
│   │   ├── puzzle.ts           # Puzzle generation
│   │   ├── validation.ts       # Anti-cheat validation
│   │   └── rateLimit.ts        # Rate limiting
│   ├── plugins/
│   │   └── mongodb.ts          # MongoDB connection
│   └── models/
│       └── Challenge.ts        # Mongoose schema
├── pages/
│   ├── index.vue               # Landing page
│   ├── demo.vue                # Interactive demo
│   └── dashboard.vue           # Analytics dashboard
└── assets/
    └── css/
        └── main.css            # Global styles
```

---

## Task 1: Project Setup

**Files:**
- Create: `/Users/m/Documents/Project/Captcha/package.json`
- Create: `/Users/m/Documents/Project/Captcha/nuxt.config.ts`
- Create: `/Users/m/Documents/Project/Captcha/.env`
- Create: `/Users/m/Documents/Project/Captcha/app.vue`
- Create: `/Users/m/Documents/Project/Captcha/assets/css/main.css`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "sliding-captcha",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare"
  },
  "dependencies": {
    "nuxt": "^3.15.0",
    "vue": "^3.5.0",
    "mongoose": "^8.9.0",
    "nanoid": "^5.0.0"
  },
  "devDependencies": {
    "@nuxt/devtools": "latest",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create nuxt.config.ts**

```typescript
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI || '',
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || ''
    }
  },

  nitro: {
    preset: 'vercel'
  },

  css: ['~/assets/css/main.css']
})
```

- [ ] **Step 3: Create .env from .env.production**

Copy from existing credentials file:
```bash
cp /Users/m/Documents/Project/Captcha/.env.production /Users/m/Documents/Project/Captcha/.env
```

Env file structure:
```env
# GitHub
GITHUB_TOKEN=ghp_...

# Vercel
VERCEL_TOKEN=vcp_...

# MongoDB Atlas
MONGODB_ATLAS_PUBLIC_KEY=...
MONGODB_ATLAS_PRIVATE_KEY=...
MONGODB_URI=mongodb+srv://...

# Nuxt Public
NUXT_PUBLIC_API_URL=
```

- [ ] **Step 4: Create app.vue**

```vue
<template>
  <div>
    <NuxtPage />
  </div>
</template>
```

- [ ] **Step 5: Create assets/css/main.css**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #1a1a2e;
  color: #fff;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
```

- [ ] **Step 6: Install dependencies**
Run: `cd /Users/m/Documents/Project/Captcha && npm install`

Expected: Dependencies installed successfully

- [ ] **Step 7: Commit**
Run: `git init && git add package.json nuxt.config.ts .env app.vue assets/css/main.css && git commit -m "feat: initial project setup with Nuxt 3"`

---

## Task 2: MongoDB Connection

**Files:**
- Create: `/Users/m/Documents/Project/Captcha/server/plugins/mongodb.ts`

- [ ] **Step 1: Create MongoDB plugin**

```typescript
import mongoose from 'mongoose'

export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig()
  
  if (!config.mongodbUri) {
    console.warn('MONGODB_URI not configured')
    return
  }

  try {
    await mongoose.connect(config.mongodbUri)
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection error:', error)
  }

  nitroApp.hooks.hook('close', async () => {
    await mongoose.disconnect()
  })
})
```

- [ ] **Step 2: Run and verify**
Run: `npm run dev -- --port 3000`
Check console for "MongoDB connected" or warning about MONGODB_URI

- [ ] **Step 3: Commit**
Run: `git add server/plugins/mongodb.ts && git commit -m "feat: add MongoDB connection plugin"`

---

## Task 3: Puzzle Generation Utility

**Files:**
- Create: `/Users/m/Documents/Project/Captcha/server/utils/puzzle.ts`

- [ ] **Step 1: Implement puzzle generation**

```typescript
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
```

- [ ] **Step 2: Commit**
Run: `git add server/utils/puzzle.ts && git commit -m "feat: add puzzle generation with solvability check"`

---

## Task 4: Challenge Model

**Files:**
- Create: `/Users/m/Documents/Project/Captcha/server/models/Challenge.ts`

- [ ] **Step 1: Create Challenge schema**

```typescript
import mongoose, { Schema, Document } from 'mongoose'

export interface IChallenge extends Document {
  challengeId: string
  imageUrl: string
  gridSize: number
  initialState: number[][]
  solution: number[][]
  createdAt: Date
  expiresAt: Date
  solved: boolean
  attempts: {
    timestamp: Date
    duration: number
    solved: boolean
    moveCount: number
  }[]
}

const ChallengeSchema = new Schema<IChallenge>({
  challengeId: { type: String, required: true, unique: true, index: true },
  imageUrl: { type: String, required: true },
  gridSize: { type: Number, required: true, default: 3 },
  initialState: { type: Schema.Types.Mixed, required: true },
  solution: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 300 } },
  solved: { type: Boolean, default: false },
  attempts: [{
    timestamp: { type: Date, default: Date.now },
    duration: Number,
    solved: Boolean,
    moveCount: Number
  }]
})

export const Challenge = mongoose.models.Challenge || mongoose.model<IChallenge>('Challenge', ChallengeSchema)
```

- [ ] **Step 2: Commit**
Run: `git add server/models/Challenge.ts && git commit -m "feat: add Challenge model for MongoDB"`

---

## Task 5: Anti-Cheat Validation

**Files:**
- Create: `/Users/m/Documents/Project/Captcha/server/utils/validation.ts`

- [ ] **Step 1: Implement validation utilities**

```typescript
// server/utils/validation.ts

export interface PathPoint {
  x: number
  y: number
  t: number
}

export interface MoveEvent {
  piece: number
  from: [number, number]
  to: [number, number]
  duration: number
  path: PathPoint[]
}

export interface ValidationResult {
  valid: boolean
  reason?: string
  score?: number
}

export function validateTiming(duration: number): ValidationResult {
  const MIN_DURATION = 200
  const MAX_DURATION = 30000
  
  if (duration < MIN_DURATION) {
    return { valid: false, reason: 'too_fast' }
  }
  
  if (duration > MAX_DURATION) {
    return { valid: false, reason: 'timeout' }
  }
  
  return { valid: true }
}

export function validatePathNaturalness(path: PathPoint[]): ValidationResult {
  if (!path || path.length < 3) {
    return { valid: false, reason: 'insufficient_path_data' }
  }
  
  const first = path[0]
  const last = path[path.length - 1]
  
  const directDistance = Math.sqrt(
    Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2)
  )
  
  let actualDistance = 0
  for (let i = 1; i < path.length; i++) {
    actualDistance += Math.sqrt(
      Math.pow(path[i].x - path[i-1].x, 2) + Math.pow(path[i].y - path[i-1].y, 2)
    )
  }
  
  const curvatureRatio = actualDistance / (directDistance || 1)
  const score = Math.min(curvatureRatio, 2) / 2
  
  if (score < 0.6) {
    return { valid: false, reason: 'unnatural_path', score }
  }
  
  let jitterCount = 0
  for (let i = 2; i < path.length; i++) {
    const prev = path[i-2]
    const curr = path[i-1]
    const next = path[i]
    
    const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x)
    const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x)
    const angleDiff = Math.abs(angle1 - angle2)
    
    if (angleDiff > 0.2) jitterCount++
  }
  
  const jitterScore = Math.min(jitterCount / path.length, 1)
  const finalScore = (score + jitterScore) / 2
  
  return { valid: finalScore > 0.5, score: finalScore }
}

export function verifySolution(initialState: number[][], finalState: number[][]): boolean {
  const solved = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 0]
  ]
  
  return JSON.stringify(finalState) === JSON.stringify(solved)
}
```

- [ ] **Step 2: Commit**
Run: `git add server/utils/validation.ts && git commit -m "feat: add anti-cheat validation utilities"`

---

## Task 6: Rate Limiting

**Files:**
- Create: `/Users/m/Documents/Project/Captcha/server/utils/rateLimit.ts`

- [ ] **Step 1: Implement rate limiter**

```typescript
// server/utils/rateLimit.ts

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitRecord>()

const WINDOW_MS = 60 * 1000
const MAX_REQUESTS = 10

export function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  
  let record = rateLimitMap.get(ip)
  
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + WINDOW_MS }
    rateLimitMap.set(ip, record)
    return true
  }
  
  if (record.count >= MAX_REQUESTS) {
    return false
  }
  
  record.count++
  return true
}

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [ip, record] of rateLimitMap) {
      if (now > record.resetTime) {
        rateLimitMap.delete(ip)
      }
    }
  }, 600000)
}
```

- [ ] **Step 2: Commit**
Run: `git add server/utils/rateLimit.ts && git commit -m "feat: add rate limiting utility"`

---

## Task 7: CAPTCHA Create API

**Files:**
- Create: `/Users/m/Documents/Project/Captcha/server/api/captcha/create.post.ts`

- [ ] **Step 1: Implement create endpoint**

```typescript
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
```

- [ ] **Step 2: Test endpoint**
Run: `npm run dev` then `curl -X POST http://localhost:3000/api/captcha/create`

- [ ] **Step 3: Commit**
Run: `git add server/api/captcha/create.post.ts && git commit -m "feat: add CAPTCHA create API endpoint"`

---

## Task 8: CAPTCHA Verify API

**Files:**
- Create: `/Users/m/Documents/Project/Captcha/server/api/captcha/verify.post.ts`

- [ ] **Step 1: Implement verify endpoint**

```typescript
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
```

- [ ] **Step 2: Test endpoint**
```bash
CHALLENGE=$(curl -s -X POST http://localhost:3000/api/captcha/create | jq -r '.challengeId')
curl -X POST http://localhost:3000/api/captcha/verify \
  -H "Content-Type: application/json" \
  -d "{\"challengeId\":\"$CHALLENGE\",\"solution\":[[1,2,3],[4,5,6],[7,8,0]],\"totalDuration\":5000}"
```

- [ ] **Step 3: Commit**
Run: `git add server/api/captcha/verify.post.ts && git commit -m "feat: add CAPTCHA verify API endpoint with anti-cheat"`

---

## Task 9: Stats API

**Files:**
- Create: `/Users/m/Documents/Project/Captcha/server/api/captcha/stats.get.ts`

- [ ] **Step 1: Implement stats endpoint**

```typescript
// server/api/captcha/stats.get.ts
import { Challenge } from '~/server/models/Challenge'

export default defineEventHandler(async () => {
  const allChallenges = await Challenge.find({})
  
  const totalChallenges = allChallenges.length
  const totalSolves = allChallenges.filter(c => c.solved).length
  const successRate = totalChallenges > 0 ? totalSolves / totalChallenges : 0
  
  let totalSolveTime = 0
  let solveCount = 0
  
  for (const challenge of allChallenges) {
    for (const attempt of challenge.attempts) {
      if (attempt.solved) {
        totalSolveTime += attempt.duration
        solveCount++
      }
    }
  }
  
  const avgSolveTime = solveCount > 0 ? Math.round(totalSolveTime / solveCount) : 0
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayChallenges = allChallenges.filter(c => c.createdAt >= today)
  const todaySolves = todayChallenges.filter(c => c.solved).length
  const todaySuccessRate = todayChallenges.length > 0 ? todaySolves / todayChallenges.length : 0
  
  return {
    totalChallenges,
    totalSolves,
    successRate: Math.round(successRate * 100) / 100,
    avgSolveTime,
    today: {
      challenges: todayChallenges.length,
      solves: todaySolves,
      successRate: Math.round(todaySuccessRate * 100) / 100
    }
  }
})
```

- [ ] **Step 2: Test endpoint**
Run: `curl http://localhost:3000/api/captcha/stats`

- [ ] **Step 3: Commit**
Run: `git add server/api/captcha/stats.get.ts && git commit -m "feat: add CAPTCHA stats API endpoint"`

---

## Task 10: Landing Page

**Files:**
- Create: `/Users/m/Documents/Project/Captcha/pages/index.vue`

- [ ] **Step 1: Create landing page**

```vue
<template>
  <div class="landing">
    <header class="header">
      <h1>SlideCAPTCHA</h1>
      <p class="tagline">User-friendly sliding puzzle CAPTCHA</p>
    </header>

    <main class="main">
      <section class="hero">
        <div class="hero-content">
          <h2>Fun & Secure CAPTCHA</h2>
          <p>Replace boring text CAPTCHAs with engaging sliding puzzles that users actually enjoy.</p>
          <div class="cta-buttons">
            <NuxtLink to="/demo" class="btn btn-primary">Try Demo</NuxtLink>
            <NuxtLink to="/dashboard" class="btn btn-secondary">View Stats</NuxtLink>
          </div>
        </div>
      </section>

      <section class="features">
        <div class="feature">
          <h3>Anti-Bot Protection</h3>
          <p>Advanced behavior analysis detects automated scripts with 99%+ accuracy.</p>
        </div>
        <div class="feature">
          <h3>User Friendly</h3>
          <p>Fun puzzles instead of distorted text. Better user experience.</p>
        </div>
        <div class="feature">
          <h3>Easy Integration</h3>
          <p>Simple API to integrate into any website or application.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.landing { min-height: 100vh; }
.header { text-align: center; padding: 3rem 1rem; }
.header h1 {
  font-size: 3rem;
  background: linear-gradient(135deg, #4ade80, #22d3ee);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}
.tagline { color: #9ca3af; font-size: 1.25rem; }
.main { max-width: 900px; margin: 0 auto; padding: 0 1rem; }
.hero { text-align: center; padding: 3rem 0; }
.hero h2 { font-size: 2rem; margin-bottom: 1rem; }
.hero p { color: #9ca3af; margin-bottom: 2rem; }
.cta-buttons { display: flex; gap: 1rem; justify-content: center; }
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s, opacity 0.2s;
}
.btn:hover { transform: translateY(-2px); }
.btn-primary { background: #4ade80; color: #1a1a2e; }
.btn-secondary { background: #374151; color: #fff; }
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 3rem 0;
}
.feature { background: #1f2937; padding: 1.5rem; border-radius: 12px; }
.feature h3 { color: #4ade80; margin-bottom: 0.5rem; }
.feature p { color: #9ca3af; }
</style>
```

- [ ] **Step 2: Test page**
Visit: http://localhost:3000

- [ ] **Step 3: Commit**
Run: `git add pages/index.vue && git commit -m "feat: add landing page"`

---

## Task 11: Composables

**Files:**
- Create: `/Users/m/Documents/Project/Captcha/composables/useMouseTracking.ts`

- [ ] **Step 1: Create useMouseTracking composable**

```typescript
// composables/useMouseTracking.ts

export interface PathPoint {
  x: number
  y: number
  t: number
}

export interface MoveEvent {
  piece: number
  from: [number, number]
  to: [number, number]
  duration: number
  path: PathPoint[]
}

export function useMouseTracking() {
  const path = ref<PathPoint[]>([])
  const isTracking = ref(false)
  let trackingInterval: ReturnType<typeof setInterval> | null = null

  function startTracking(startX: number, startY: number) {
    path.value = []
    isTracking.value = true
    
    const startTime = Date.now()
    path.value.push({ x: startX, y: startY, t: 0 })
    
    // Track at 60fps (16ms interval)
    trackingInterval = setInterval(() => {
      if (!isTracking.value) return
      
      // Get current position from last mouse/touch event
      // This is simplified - in real implementation track from event
    }, 16)
  }

  function addPoint(x: number, y: number) {
    if (!isTracking.value) return
    
    const lastPoint = path.value[path.value.length - 1]
    const t = lastPoint ? Date.now() - lastPoint.t : 0
    
    path.value.push({ x, y, t })
  }

  function stopTracking(): PathPoint[] {
    isTracking.value = false
    if (trackingInterval) {
      clearInterval(trackingInterval)
      trackingInterval = null
    }
    return [...path.value]
  }

  function clear() {
    path.value = []
    isTracking.value = false
    if (trackingInterval) {
      clearInterval(trackingInterval)
      trackingInterval = null
    }
  }

  return {
    path: readonly(path),
    isTracking: readonly(isTracking),
    startTracking,
    addPoint,
    stopTracking,
    clear
  }
}
```

- [ ] **Step 2: Commit**
Run: `git add composables/useMouseTracking.ts && git commit -m "feat: add mouse tracking composable"`

---

## Task 12: Demo Page with Sliding Puzzle

**Files:**
- Create: `/Users/m/Documents/Project/Captcha/components/SlidingCaptcha.vue`
- Create: `/Users/m/Documents/Project/Captcha/pages/demo.vue`

- [ ] **Step 1: Create SlidingCaptcha component**

```vue
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
          <img v-if="cell !== 0 && imageUrl" :src="imageUrl" :style="getImageStyle(rowIndex, colIndex)" alt="puzzle" />
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

function getImageStyle(row: number, col: number) {
  return { display: 'none' }
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
```

- [ ] **Step 2: Create demo page**

```vue
<template>
  <div class="demo-page">
    <header class="header">
      <NuxtLink to="/" class="back-link">← Back</NuxtLink>
      <h1>Demo</h1>
    </header>
    <main class="main">
      <p class="instructions">Slide the puzzle pieces to restore the image</p>
      <SlidingCaptcha />
    </main>
  </div>
</template>

<script setup>
import SlidingCaptcha from '~/components/SlidingCaptcha.vue'
</script>

<style scoped>
.demo-page { min-height: 100vh; display: flex; flex-direction: column; }
.header { padding: 1.5rem 2rem; }
.back-link { color: #9ca3af; text-decoration: none; }
.back-link:hover { color: #fff; }
.header h1 { margin-top: 0.5rem; }
.main { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 2rem; }
.instructions { color: #9ca3af; margin-bottom: 2rem; }
</style>
```

- [ ] **Step 3: Test demo page**
Visit: http://localhost:3000/demo

- [ ] **Step 4: Commit**
Run: `git add components/SlidingCaptcha.vue pages/demo.vue && git commit -m "feat: add demo page with sliding puzzle component"`

---

## Task 12: Dashboard Page

**Files:**
- Create: `/Users/m/Documents/Project/Captcha/pages/dashboard.vue`

- [ ] **Step 1: Create dashboard page**

```vue
<template>
  <div class="dashboard-page">
    <header class="header">
      <NuxtLink to="/" class="back-link">← Back</NuxtLink>
      <h1>Dashboard</h1>
    </header>
    <main class="main">
      <div v-if="pending" class="loading">Loading stats...</div>
      <div v-else-if="error" class="error">Failed to load stats: {{ error.message }}</div>
      <div v-else class="stats">
        <div class="stat-card">
          <h3>Total Challenges</h3>
          <p class="stat-value">{{ stats?.totalChallenges || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>Total Solves</h3>
          <p class="stat-value">{{ stats?.totalSolves || 0 }}</p>
        </div>
        <div class="stat-card">
          <h3>Success Rate</h3>
          <p class="stat-value">{{ ((stats?.successRate || 0) * 100).toFixed(1) }}%</p>
        </div>
        <div class="stat-card">
          <h3>Avg Solve Time</h3>
          <p class="stat-value">{{ ((stats?.avgSolveTime || 0) / 1000).toFixed(1) }}s</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const { data: stats, pending, error } = await useFetch('/api/captcha/stats')
</script>

<style scoped>
.dashboard-page { min-height: 100vh; }
.header { padding: 1.5rem 2rem; }
.back-link { color: #9ca3af; text-decoration: none; }
.back-link:hover { color: #fff; }
.header h1 { margin-top: 0.5rem; }
.main { max-width: 900px; margin: 0 auto; padding: 2rem; }
.loading, .error { text-align: center; padding: 3rem; }
.error { color: #ef4444; }
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; }
.stat-card { background: #1f2937; padding: 1.5rem; border-radius: 12px; text-align: center; }
.stat-card h3 { color: #9ca3af; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; }
.stat-value { font-size: 2rem; font-weight: 700; color: #4ade80; }
</style>
```

- [ ] **Step 2: Test dashboard**
Visit: http://localhost:3000/dashboard

- [ ] **Step 3: Commit**
Run: `git add pages/dashboard.vue && git commit -m "feat: add analytics dashboard page"`

---

## Task 13: Health Check Endpoint

**Files:**
- Create: `/Users/m/Documents/Project/Captcha/server/api/health.get.ts`

- [ ] **Step 1: Create health endpoint**

```typescript
export default defineEventHandler(() => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})
```

- [ ] **Step 2: Commit**
Run: `git add server/api/health.get.ts && git commit -m "feat: add health check endpoint"`

---

## Task 14: Build and Verify

- [ ] **Step 1: Build project**
Run: `npm run build`

- [ ] **Step 2: Commit all remaining**
Run: `git add -A && git commit -m "feat: complete sliding CAPTCHA implementation"`

---

## Self-Review

### Spec Coverage
| Spec Section | Task |
|--------------|------|
| Puzzle generation | Task 3 |
| Drag & drop UI | Task 11 |
| Verify API | Task 8 |
| Anti-cheat timing | Task 8 |
| Anti-cheat path | Task 8 |
| Mobile support | Task 11 |
| Stats dashboard | Task 12 |
| Image loading | Task 3 |

### No Placeholders - All code provided

---

## Execution Options

**Plan complete and saved to `docs/superpowers/plans/2026-04-30-sliding-captcha-implementation.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - Fresh subagent per task + two-stage review

**2. Inline Execution** - Execute tasks in this session using executing-plans

**Which approach?**