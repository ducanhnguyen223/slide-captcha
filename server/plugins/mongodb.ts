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