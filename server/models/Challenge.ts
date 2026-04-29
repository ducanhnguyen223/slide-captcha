import mongoose, { Schema, Document } from 'mongoose'

export interface IChallenge extends Document {
  challengeId: string
  imageUrl: string
  gridSize: number
  initialState: number[][]
  solution: number[][]
  createdAt: Date
  expiresAt: Date
  solved: boolean
  attempts: {
    timestamp: Date
    duration: number
    solved: boolean
    moveCount: number
  }[]
}

const ChallengeSchema = new Schema<IChallenge>({
  challengeId: { type: String, required: true, unique: true, index: true },
  imageUrl: { type: String, required: true },
  gridSize: { type: Number, required: true, default: 3 },
  initialState: { type: Schema.Types.Mixed, required: true },
  solution: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 300 } },
  solved: { type: Boolean, default: false },
  attempts: [{
    timestamp: { type: Date, default: Date.now },
    duration: Number,
    solved: Boolean,
    moveCount: Number
  }]
})

export const Challenge = mongoose.models.Challenge || mongoose.model<IChallenge>('Challenge', ChallengeSchema)
