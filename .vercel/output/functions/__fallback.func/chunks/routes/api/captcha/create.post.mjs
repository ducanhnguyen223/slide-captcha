import { d as defineEventHandler, g as getHeader, c as createError } from '../../../nitro/nitro.mjs';
import { C as Challenge } from '../../../_/Challenge.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';

const SOLVED_STATE = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 0]
];
function getEmptyPosition(state) {
  for (let row = 0; row < state.length; row++) {
    for (let col = 0; col < state[row].length; col++) {
      if (state[row][col] === 0) return { row, col };
    }
  }
  throw new Error("No empty position found");
}
function applyMove(state, fromRow, fromCol) {
  const newState = state.map((row) => [...row]);
  const empty = getEmptyPosition(state);
  const rowDiff = Math.abs(fromRow - empty.row);
  const colDiff = Math.abs(fromCol - empty.col);
  if (rowDiff === 1 && colDiff === 0 || rowDiff === 0 && colDiff === 1) {
    newState[empty.row][empty.col] = newState[fromRow][fromCol];
    newState[fromRow][fromCol] = 0;
  }
  return newState;
}
function deepClone(arr) {
  return arr.map((row) => [...row]);
}
function generatePuzzle(gridSize = 3) {
  let state = deepClone(SOLVED_STATE);
  const challengeId = `chg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const moveCount = 15 + Math.floor(Math.random() * 10);
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1]
  ];
  for (let i = 0; i < moveCount; i++) {
    const empty = getEmptyPosition(state);
    const validMoves = directions.map(([dRow, dCol]) => ({ row: empty.row + dRow, col: empty.col + dCol })).filter((pos) => pos.row >= 0 && pos.row < gridSize && pos.col >= 0 && pos.col < gridSize);
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    state = applyMove(state, randomMove.row, randomMove.col);
  }
  const imageUrl = `https://picsum.photos/seed/${challengeId}/300/300`;
  return {
    challengeId,
    gridSize,
    imageUrl,
    initialState: state,
    solution: SOLVED_STATE,
    createdAt: /* @__PURE__ */ new Date(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1e3)
  };
}

const rateLimitMap = /* @__PURE__ */ new Map();
const WINDOW_MS = 60 * 1e3;
const MAX_REQUESTS = 10;
function checkRateLimit(ip) {
  const now = Date.now();
  let record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + WINDOW_MS };
    rateLimitMap.set(ip, record);
    return true;
  }
  if (record.count >= MAX_REQUESTS) {
    return false;
  }
  record.count++;
  return true;
}
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap) {
      if (now > record.resetTime) {
        rateLimitMap.delete(ip);
      }
    }
  }, 6e5);
}

const create_post = defineEventHandler(async (event) => {
  const ip = getHeader(event, "x-forwarded-for") || getHeader(event, "x-real-ip") || "unknown";
  if (!checkRateLimit(ip)) {
    throw createError({
      statusCode: 429,
      statusMessage: "Too many requests"
    });
  }
  const puzzle = generatePuzzle();
  const challenge = new Challenge({
    challengeId: puzzle.challengeId,
    imageUrl: puzzle.imageUrl,
    gridSize: puzzle.gridSize,
    initialState: puzzle.initialState,
    solution: puzzle.solution,
    createdAt: puzzle.createdAt,
    expiresAt: puzzle.expiresAt,
    solved: false,
    attempts: []
  });
  await challenge.save();
  return {
    challengeId: puzzle.challengeId,
    imageUrl: puzzle.imageUrl,
    grid: puzzle.initialState,
    expiresAt: puzzle.expiresAt.toISOString()
  };
});

export { create_post as default };
//# sourceMappingURL=create.post.mjs.map
