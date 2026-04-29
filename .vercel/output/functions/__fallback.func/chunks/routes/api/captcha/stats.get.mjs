import { d as defineEventHandler } from '../../../nitro/nitro.mjs';
import { C as Challenge } from '../../../_/Challenge.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const stats_get = defineEventHandler(async () => {
  const allChallenges = await Challenge.find({});
  const totalChallenges = allChallenges.length;
  const totalSolves = allChallenges.filter((c) => c.solved).length;
  const successRate = totalChallenges > 0 ? totalSolves / totalChallenges : 0;
  let totalSolveTime = 0;
  let solveCount = 0;
  for (const challenge of allChallenges) {
    for (const attempt of challenge.attempts) {
      if (attempt.solved) {
        totalSolveTime += attempt.duration;
        solveCount++;
      }
    }
  }
  const avgSolveTime = solveCount > 0 ? Math.round(totalSolveTime / solveCount) : 0;
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const todayChallenges = allChallenges.filter((c) => c.createdAt >= today);
  const todaySolves = todayChallenges.filter((c) => c.solved).length;
  const todaySuccessRate = todayChallenges.length > 0 ? todaySolves / todayChallenges.length : 0;
  return {
    totalChallenges,
    totalSolves,
    successRate: Math.round(successRate * 100) / 100,
    avgSolveTime,
    today: {
      challenges: todayChallenges.length,
      solves: todaySolves,
      successRate: Math.round(todaySuccessRate * 100) / 100
    }
  };
});

export { stats_get as default };
//# sourceMappingURL=stats.get.mjs.map
