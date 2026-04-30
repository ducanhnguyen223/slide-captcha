import mongoose from 'mongoose'

export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig()
  const mongoUri = config.mongodbUri || process.env.MONGODB_URI

  if (!mongoUri) {
    console.error('MONGODB_URI not configured')
    return
  }

  console.log('MongoDB connecting to:', mongoUri.replace(/:([^@]+)@/, ':****@'))

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    })
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection error:', error)
  }

  nitroApp.hooks.hook('close', async () => {
    await mongoose.disconnect()
  })
})