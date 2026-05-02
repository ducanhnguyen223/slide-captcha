import mongoose from 'mongoose'

let isConnected = false

export async function ensureConnection(): Promise<boolean> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return true
  }

  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    console.error('MONGODB_URI not configured')
    return false
  }

  mongoose.set('bufferCommands', false)

  // If already connecting, wait for it
  if (mongoose.connection.readyState === 2) {
    await new Promise<void>((resolve) => {
      mongoose.connection.once('open', () => resolve())
      mongoose.connection.once('error', () => resolve())
    })
    if (mongoose.connection.readyState === 1) {
      isConnected = true
      return true
    }
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5,
    })

    isConnected = mongoose.connection.readyState === 1
    console.log('MongoDB connected, readyState:', mongoose.connection.readyState)
    return isConnected
  } catch (error) {
    console.error('MongoDB connection error:', error)
    isConnected = false
    return false
  }
}

export default defineNitroPlugin(() => {})
