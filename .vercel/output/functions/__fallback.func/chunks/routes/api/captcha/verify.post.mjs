import { d as defineEventHandler, r as readBody, c as createError } from '../../../nitro/nitro.mjs';
import { C as Challenge } from '../../../_/Challenge.mjs';
import { nanoid } from 'nanoid';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

function validateTiming(duration) {
  const MIN_DURATION = 200;
  const MAX_DURATION = 3e4;
  if (duration < MIN_DURATION) {
    return { valid: false, reason: "too_fast" };
  }
  if (duration > MAX_DURATION) {
    return { valid: false, reason: "timeout" };
  }
  return { valid: true };
}
function validatePathNaturalness(path) {
  if (!path || path.length < 3) {
    return { valid: false, reason: "insufficient_path_data" };
  }
  const first = path[0];
  const last = path[path.length - 1];
  const directDistance = Math.sqrt(
    Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2)
  );
  let actualDistance = 0;
  for (let i = 1; i < path.length; i++) {
    actualDistance += Math.sqrt(
      Math.pow(path[i].x - path[i - 1].x, 2) + Math.pow(path[i].y - path[i - 1].y, 2)
    );
  }
  const curvatureRatio = actualDistance / (directDistance || 1);
  const score = Math.min(curvatureRatio, 2) / 2;
  if (score < 0.6) {
    return { valid: false, reason: "unnatural_path", score };
  }
  let jitterCount = 0;
  for (let i = 2; i < path.length; i++) {
    const prev = path[i - 2];
    const curr = path[i - 1];
    const next = path[i];
    const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
    const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
    const angleDiff = Math.abs(angle1 - angle2);
    if (angleDiff > 0.2) jitterCount++;
  }
  const jitterScore = Math.min(jitterCount / path.length, 1);
  const finalScore = (score + jitterScore) / 2;
  return { valid: finalScore > 0.5, score: finalScore };
}
function verifySolution(initialState, finalState) {
  const solved = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 0]
  ];
  return JSON.stringify(finalState) === JSON.stringify(solved);
}

const verify_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { challengeId, solution, moves, totalDuration } = body;
  const challenge = await Challenge.findOne({ challengeId });
  if (!challenge) {
    throw createError({ statusCode: 404, statusMessage: "Challenge not found" });
  }
  if (challenge.solved) {
    throw createError({ statusCode: 400, statusMessage: "Challenge already solved" });
  }
  if (/* @__PURE__ */ new Date() > challenge.expiresAt) {
    throw createError({ statusCode: 410, statusMessage: "Challenge expired" });
  }
  const timingResult = validateTiming(totalDuration);
  if (!timingResult.valid) {
    challenge.attempts.push({
      timestamp: /* @__PURE__ */ new Date(),
      duration: totalDuration,
      solved: false,
      moveCount: (moves == null ? void 0 : moves.length) || 0
    });
    await challenge.save();
    return { success: false, reason: timingResult.reason };
  }
  if (moves && moves.length > 0) {
    for (const move of moves) {
      if (move.path && move.path.length > 0) {
        const pathResult = validatePathNaturalness(move.path);
        if (!pathResult.valid) {
          challenge.attempts.push({
            timestamp: /* @__PURE__ */ new Date(),
            duration: totalDuration,
            solved: false,
            moveCount: moves.length
          });
          await challenge.save();
          return { success: false, reason: pathResult.reason };
        }
      }
    }
  }
  const isCorrect = verifySolution(challenge.initialState, solution);
  if (!isCorrect) {
    challenge.attempts.push({
      timestamp: /* @__PURE__ */ new Date(),
      duration: totalDuration,
      solved: false,
      moveCount: (moves == null ? void 0 : moves.length) || 0
    });
    await challenge.save();
    return { success: false, reason: "invalid_solution" };
  }
  challenge.solved = true;
  challenge.attempts.push({
    timestamp: /* @__PURE__ */ new Date(),
    duration: totalDuration,
    solved: true,
    moveCount: (moves == null ? void 0 : moves.length) || 0
  });
  await challenge.save();
  const token = `csc_${nanoid(24)}`;
  return { success: true, token, solvedIn: totalDuration };
});

export { verify_post as default };
//# sourceMappingURL=verify.post.mjs.map
