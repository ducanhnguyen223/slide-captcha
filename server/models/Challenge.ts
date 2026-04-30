import mongoose, { Schema, Document } from 'mongoose'

export interface IChallenge extends Document {
  challengeId: string
  imageUrl: string
  gapPosition: number
  solution: number
  createdAt: Date
  expiresAt: Date
  solved: boolean
  attempts: {
    timestamp: Date
    sliderPosition: number
    duration: number
    solved: boolean
  }[]
}

const ChallengeSchema = new Schema<IChallenge>({
  challengeId: { type: String, required: true, unique: true, index: true },
  imageUrl: { type: String, required: true },
  gapPosition: { type: Number, required: true },
  solution: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 300 } },
  solved: { type: Boolean, default: false },
  attempts: [{
    timestamp: { type: Date, default: Date.now },
    sliderPosition: Number,
    duration: Number,
    solved: Boolean
  }]
})

export const Challenge = mongoose.models.Challenge || mongoose.model<IChallenge>('Challenge', ChallengeSchema)
