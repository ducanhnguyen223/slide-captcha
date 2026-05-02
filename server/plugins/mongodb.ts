import mongoose from 'mongoose'

let isConnected = false

export async function ensureConnection(): Promise<boolean> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return true
  }

  const mongoUri = process.env.MONGODB_URI || useRuntimeConfig().mongodbUri

  if (!mongoUri) {
    console.error('MONGODB_URI not configured')
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
