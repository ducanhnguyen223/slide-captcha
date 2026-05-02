import mongoose from 'mongoose'

let cachedConnection: typeof mongoose | null = null

export default defineNitroPlugin(async (nitroApp) => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return
  }

  const config = useRuntimeConfig()
  const mongoUri = config.mongodbUri || process.env.MONGODB_URI

  if (!mongoUri) {
    console.error('MONGODB_URI not configured')
    return
  }

  console.log('MongoDB connecting to:', mongoUri.replace(/:([^@]+)@/, ':****@'))

  try {
    mongoose.set('bufferCommands', false)

    cachedConnection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5,
      minPoolSize: 1,
    })
    console.log('MongoDB connected successfully, state:', mongoose.connection.readyState)
  } catch (error) {
    console.error('MongoDB connection error:', error)
    cachedConnection = null
  }

  nitroApp.hooks.hook('close', async () => {
    cachedConnection = null
    await mongoose.disconnect()
  })
})