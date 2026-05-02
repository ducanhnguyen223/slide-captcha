import mongoose from 'mongoose'

let isConnected = false

export async function ensureConnection(): Promise<boolean> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return true
  }

  // Must reference process.env.MONGODB_URI directly in server code
  // so Vercel injects it into serverless functions at runtime.
  // useRuntimeConfig() evaluates at build time on Vercel and returns "".
  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    console.error('MONGODB_URI not configured. Make sure it is set in Vercel Environment Variables.')
    return false
  }

  console.log('MongoDB connecting...')

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5,
    })

    isConnected = conn.connection.readyState === 1
    console.log('MongoDB connected, readyState:', conn.connection.readyState)
    return isConnected
  } catch (error) {
    console.error('MongoDB connection error:', error)
    isConnected = false
    return false
  }
}

export default defineNitroPlugin(() => {
  mongoose.set('bufferCommands', false)
})
