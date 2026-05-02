import mongoose from 'mongoose'

let connectionReady = false
let connectionPromise: Promise<typeof mongoose | null> | null = null

async function ensureConnection(): Promise<typeof mongoose | null> {
  if (mongoose.connection.readyState === 1) {
    connectionReady = true
    return mongoose
  }

  if (connectionPromise) return connectionPromise

  const config = useRuntimeConfig()
  const mongoUri = config.mongodbUri || process.env.MONGODB_URI

  if (!mongoUri) {
    console.error('MONGODB_URI not configured')
    return null
  }

  console.log('MongoDB connecting to:', mongoUri.replace(/:([^@]+)@/, ':****@'))

  mongoose.set('bufferCommands', false)

  connectionPromise = mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    maxPoolSize: 5,
    minPoolSize: 1,
  }).then((conn) => {
    console.log('MongoDB connected successfully')
    connectionReady = true
    return conn
  }).catch((error) => {
    console.error('MongoDB connection error:', error)
    connectionPromise = null
    return null
  })

  return connectionPromise
}

export default defineNitroPlugin(async (nitroApp) => {
  await ensureConnection()

  nitroApp.hooks.hook('close', async () => {
    connectionReady = false
    connectionPromise = null
    await mongoose.disconnect()
  })
})

export { ensureConnection }
