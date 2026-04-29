# Sliding Puzzle CAPTCHA - Design Specification

**Version:** 1.0  
**Date:** 2026-04-30  
**Status:** Draft  
**Author:** Brainstorming with Anh Duc  

---

## 1. Project Overview

### 1.1 Project Name
**SlideCAPTCHA** - Sliding Puzzle CAPTCHA-as-a-Service

### 1.2 Project Type
Proof-of-concept CAPTCHA service với dashboard analytics

### 1.3 Core Functionality
- Interactive sliding puzzle (3x3) như các app Trung Quốc (Bilibili, WeChat)
- Anti-cheat via mouse/touch behavior analysis
- API để integrate vào các ứng dụng khác
- Dashboard xem analytics cơ bản

### 1.4 Target Users
- Developers cần CAPTCHA cho website của họ
- Site owners muốn user-friendly captcha thay vì text-based

---

## 2. Architecture

### 2.1 Tech Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| Frontend | Nuxt 3 (Vue 3 + TypeScript) | Fullstack, deploy easy |
| Backend | Nitro Server (built-in Nuxt) | Native, không cần separate Express |
| Database | MongoDB Atlas M0 (free) | 500MB, shared cluster |
| Deployment | Vercel | Free tier, edge support |
| Image Source | Unsplash API (free) | Random high-quality images |

### 2.2 Project Structure

```
sliding-captcha/
├── app.vue                    # Root layout
├── nuxt.config.ts             # Nuxt configuration
├── package.json
├── components/
│   ├── SlidingCaptcha.vue     # Main puzzle component
│   ├── CaptchaPiece.vue       # Individual puzzle piece
│   ├── CaptchaGrid.vue        # Grid container
│   └── CaptchaSuccess.vue     # Success animation
├── composables/
│   ├── useCaptcha.ts          # Create/verify captcha API
│   ├── useMouseTracking.ts    # Mouse/touch path tracking
│   └── useImageLoader.ts      # Image loading & slicing
├── server/
│   ├── api/
│   │   ├── captcha/
│   │   │   ├── create.post.ts # Create new challenge
│   │   │   ├── verify.post.ts # Verify solution + behavior
│   │   │   └── stats.get.ts   # Get analytics
│   │   └── health.get.ts
│   ├── utils/
│   │   ├── puzzle.ts          # Puzzle generation logic
│   │   └── validation.ts      # Anti-cheat validation
│   └── models/
│       └── Challenge.ts       # Mongoose schema
├── pages/
│   ├── index.vue              # Landing + demo
│   ├── demo.vue               # Interactive demo
│   └── dashboard.vue          # Simple analytics
├── assets/
│   └── css/
│       └── main.css           # Global styles
└── public/
    └── favicon.ico
```

### 2.3 High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER VISITS /demo                        │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. Client calls POST /api/captcha/create                       │
│    - Server generates solvable puzzle from random image        │
│    - Returns: challengeId, shuffled grid, image segments        │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Client renders 3x3 sliding puzzle                           │
│    - User drags pieces to solve                                 │
│    - Mouse/touch path tracked at 60fps                          │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. User clicks "Verify"                                         │
│    - Client sends: solution + moves + path + timing             │
│    - Server validates:                                          │
│      a) Rate limit check                                        │
│      b) Challenge exists & not expired                          │
│      c) Timing analysis (200ms - 30s)                          │
│      d) Path naturalness (bezier, jitter)                       │
│      e) Puzzle solution correctness                             │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
            ┌───────────────┐         ┌───────────────┐
            │  ✅ SUCCESS   │         │  ❌ FAILED    │
            │ Return token  │         │ Return error  │
            │ Log to stats  │         │ New challenge │
            └───────────────┘         └───────────────┘
```

---

## 3. UI/UX Specification

### 3.1 Pages

#### 3.1.1 Landing Page (`/`)
- Giới thiệu dịch vụ
- Link to demo
- Link to dashboard
- Code snippet để integrate

#### 3.1.2 Demo Page (`/demo`)
- Interactive sliding puzzle 3x3
- Real-time feedback
- Show success/error state

#### 3.1.3 Dashboard (`/dashboard`)
- Simple stats: total challenges, success rate, avg time
- No authentication for MVP

### 3.2 Component: SlidingCaptcha.vue

#### Visual Design
- **Container**: 300x300px (responsive: 90vw max 400px)
- **Piece size**: 100x100px (3x3 grid)
- **Background**: Dark theme (#1a1a2e)
- **Piece border**: 2px solid rgba(255,255,255,0.1)
- **Empty slot**: Semi-transparent (#ffffff10)
- **Success glow**: Green (#4ade80) box-shadow

#### Puzzle Image Sourcing
- **Source A (Free, No API Key):** Picsum Photos - `https://picsum.photos/seed/{SEED}/300/300`
- **Source B (Deprecated):** Unsplash Source - fallback only
- **Fallback:** CSS gradient generator nếu tất cả fail

**Implementation:**
```typescript
function getPuzzleImage(seed: string): string {
  // Primary: Picsum with consistent seed per challenge
  return `https://picsum.photos/seed/${seed}/300/300`;
}

// Client-side preload check
async function preloadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    setTimeout(() => resolve(false), 3000);
  });
}
```

#### Animations
- **Snap animation**: 150ms ease-out
- **Success**: Scale bounce + glow fade-in (300ms)
- **Fail shake**: Horizontal shake (200ms)

#### User Interactions
1. Click & drag piece → Move to adjacent empty slot
2. Release → Snap to position if valid
3. Click "Verify" → Submit to server
4. Success → Show celebration + token
5. Fail → Shake + new challenge

### 3.3 Mobile Support
- Touch events (touchstart, touchmove, touchend)
- Touch normalization: xử lý coords khác giữa touch vs mouse
- Larger hit areas (minimum 44px)
- Responsive container sizing
- Prevent scroll khi kéo trong container

**Touch Event Normalization:**
```typescript
function getEventCoords(e: MouseEvent | TouchEvent): { x: number; y: number } {
  if ('touches' in e) {
    // Touch event
    const touch = e.touches[0] || e.changedTouches[0];
    return { x: touch.clientX, y: touch.clientY };
  }
  // Mouse event
  return { x: e.clientX, y: e.clientY };
}

// Draggable handler
function handleDragStart(e: MouseEvent | TouchEvent) {
  // Prevent default for touch to stop scrolling
  e.preventDefault();
  const { x, y } = getEventCoords(e);
  // ... rest of drag logic
}
```

---

## 4. Functionality Specification

### 4.1 Puzzle Generation (server/utils/puzzle.ts)

```typescript
interface PuzzleConfig {
  challengeId: string;
  gridSize: 3;  // 3x3
  imageUrl: string;
  initialState: number[][];  // Ma trận vị trí pieces
  solution: number[][];      // Ma trận đích (solved state)
  createdAt: Date;
  expiresAt: Date;
}
```

#### Algorithm: Fisher-Yates Shuffle with Solvability Check

1. Start from solved state [[1,2,3],[4,5,6],[7,8,0]]
2. Apply random valid moves (15-25 moves)
3. Reverse-verify: solvable if inversions count is even
4. Store initial state + solution

### 4.2 Anti-Cheat System

#### Layer 1: Timing Analysis

| Check | Threshold | Action |
|-------|-----------|--------|
| Total solve time | < 200ms | REJECT (too fast) |
| Total solve time | > 30s | REJECT (timeout/abandon) |
| Per-move time | < 50ms | REJECT (unnatural) |

#### Layer 2: Mouse/Touch Path Analysis

```typescript
interface PathPoint {
  x: number;
  y: number;
  t: number;  // timestamp from start
  pressure?: number;  // touch only
}

interface PathAnalysis {
  isStraightLine: boolean;      // Bot: true
  hasMicroJitter: boolean;      // Human: true
  accelerationVariance: number; // Human: high variance
  curvatureScore: number;       // Human: > 0.5
}
```

**Natural Path Detection Algorithm:**
1. Sample path points every 16ms (60fps)
2. Calculate Bezier curves between points
3. Detect micro-corrections (jitter)
4. Calculate acceleration profile
5. Score 0-1, reject if < 0.6

#### Layer 3: Solution Verification

```typescript
function verifySolution(initial: number[][], moves: Move[], final: number[][]) {
  // Apply moves to initial state
  let state = deepClone(initial);
  for (const move of moves) {
    state = applyMove(state, move);
  }
  
  // Check if matches target solution
  return JSON.stringify(state) === JSON.stringify(SOLUTION_STATE);
}
```

### 4.3 API Endpoints

#### POST /api/captcha/create

**Request:**
```json
{}
```

**Response (200):**
```json
{
  "challengeId": "chg_abc123xyz",
  "imageUrl": "https://images.unsplash.com/...",
  "grid": [
    [1, 2, 3],
    [4, 0, 5],
    [7, 8, 6]
  ],
  "expiresAt": "2026-04-30T12:05:00Z"
}
```

#### POST /api/captcha/verify

**Request:**
```json
{
  "challengeId": "chg_abc123xyz",
  "solution": [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 0]
  ],
  "moves": [
    {
      "piece": 6,
      "from": [2, 2],
      "to": [2, 1],
      "duration": 150,
      "path": [{ "x": 200, "y": 200, "t": 0 }, ...]
    }
  ],
  "totalDuration": 2500
}
```

**Response (200 - Success):**
```json
{
  "success": true,
  "token": "csc_abc123def456",
  "solvedIn": 2500
}
```

**Response (400 - Failed):**
```json
{
  "success": false,
  "reason": "invalid_solution",
  "newChallengeId": "chg_new456"
}
```

#### GET /api/captcha/stats

**Response (200):**
```json
{
  "totalChallenges": 1250,
  "totalSolves": 1100,
  "successRate": 0.88,
  "avgSolveTime": 4500,
  "today": {
    "challenges": 45,
    "solves": 40,
    "successRate": 0.89
  }
}
```

### 4.4 Database Schema

#### Collection: challenges

```typescript
{
  _id: ObjectId,
  challengeId: String (unique, indexed),
  imageUrl: String,
  gridSize: Number,
  initialState: Object,  // Matrix
  solution: Object,      // Matrix
  createdAt: Date,
  expiresAt: Date (indexed, TTL: 300),
  solved: Boolean,
  
  // Attempt tracking
  attempts: [{
    timestamp: Date,
    duration: Number,
    solved: Boolean,
    pathPoints: Array,  // For analysis
    moveCount: Number,
    userAgent: String
  }],
  
  // Analytics
  clientToken: String (hashed),
  ipHash: String
}
```

#### Indexes
```javascript
{ challengeId: 1 }           // Unique
{ expiresAt: 1 }             // TTL auto-delete
{ createdAt: -1 }            // Sorting
```

---

## 5. Acceptance Criteria

### 5.1 Functional Requirements

| ID | Requirement | Success Condition |
|----|-------------|-------------------|
| F1 | Puzzle generation | Random solvable 3x3 puzzle each request |
| F2 | Drag & drop | Smooth dragging, snap to valid positions |
| F3 | Verify API | Correct validation of solution |
| F4 | Anti-cheat timing | Reject < 200ms solutions |
| F5 | Anti-cheat path | Detect straight-line bot movement |
| F6 | Mobile support | Works on touch devices |
| F7 | Stats dashboard | Show real-time analytics |
| F8 | Image loading | Random images from Unsplash |

### 5.2 Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NF1 | API latency | < 200ms p95 |
| NF2 | Page load | < 3s first load |
| NF3 | Mobile UX | Smooth 60fps drag |
| NF4 | Error handling | Graceful fallback on failure |
| NF5 | Auto-cleanup | Challenges expire after 5 min |

### 5.3 Security Requirements

| ID | Requirement | Implementation |
|----|-------------|----------------|
| S1 | Rate limit: 10 requests/minute per IP | In-memory Map with expiry (MVP) |
| S2 | Challenge one-time use | Mark solved=true after first success |
| S3 | Path data not exposed in response | Only return boolean + token |
| S4 | No sensitive data in logs | Hash IP, token before logging |

#### Rate Limit Implementation (MVP)
```typescript
// server/utils/rateLimit.ts
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10;
  
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) return false;
  record.count++;
  return true;
}

// Auto-cleanup every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap) {
    if (now > record.resetTime) rateLimitMap.delete(ip);
  }
}, 60000);
```

---

## 6. Future Considerations (Post-MVP)

- **Multi-tenant**: Multiple sites, API keys
- **Billing**: Credit-based system
- **Auth**: Dashboard login
- **Puzzle variations**: 4x4, 5x5, gap-match style
- **Additional captcha types**: Image classification, behavioral
- **Webhooks**: Notify on suspicious activity

---

## 7. Dependencies

```json
{
  "dependencies": {
    "nuxt": "^3.x",
    "@nuxtjs/tailwindcss": "^6.x",
    "mongoose": "^8.x",
    "@vueuse/core": "^10.x",
    "nanoid": "^5.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@nuxt/devtools": "latest"
  }
}
```

---

## 8. Environment Variables

```env
# .env
MONGODB_URI=mongodb+srv://...
NUXT_PUBLIC_API_URL=https://your-app.vercel.app/api
UNSPLASH_ACCESS_KEY=your_key  # Optional, works without
```

---

**Document Status:** Ready for Implementation  
**Next Step:** Invoke writing-plans skill for detailed implementation plan