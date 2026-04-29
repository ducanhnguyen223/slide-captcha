import mongoose, { Schema } from 'mongoose';

const ChallengeSchema = new Schema({
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
});
const Challenge = mongoose.models.Challenge || mongoose.model("Challenge", ChallengeSchema);

export { Challenge as C };
//# sourceMappingURL=Challenge.mjs.map
