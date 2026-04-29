export default defineNuxtConfig({
  devtools: { enabled: true },
  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI || ''
  },
  nitro: {
    preset: 'vercel'
  },
  css: ['~/assets/css/main.css']
})