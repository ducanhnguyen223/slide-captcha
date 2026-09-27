# SlideCAPTCHA

An experimental Nuxt 3 demo of a sliding-puzzle challenge flow, with a Vue interface and MongoDB-backed challenge records.

## Important limitation

This is a prototype, not a production CAPTCHA or a security control. The current create endpoint returns `gapPosition` to the browser, so the challenge answer is visible before verification. The repository has no measured anti-bot accuracy or automated test suite; do not use it to protect a real account, form, or transaction.

## What is included

- A landing page, interactive demo, and simple challenge statistics page.
- API routes to create and verify a challenge, read demo statistics, and check service health.
- Mongoose persistence, challenge expiry, and a basic in-process request limit.

## Run locally

Requirements: Node.js and a MongoDB instance.

```sh
npm ci
export MONGODB_URI='mongodb://127.0.0.1:27017/slidecaptcha'
npm run dev
```

Open `http://localhost:3000`. The demo and dashboard are available at `/demo` and `/dashboard`.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/captcha/create` | Create a demo challenge |
| `POST` | `/api/captcha/verify` | Check a submitted slider position |
| `GET` | `/api/captcha/stats` | Read aggregate demo statistics |
| `GET` | `/api/health` | Basic health response |

## Stack

Nuxt 3, Vue 3, TypeScript, MongoDB, and Mongoose.
