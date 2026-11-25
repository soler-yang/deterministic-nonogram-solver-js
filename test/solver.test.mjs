import test from "node:test";
import assert from "node:assert/strict";
import { solveNonogram, solveLightsOutGF2 } from "../src/index.mjs";

test("solves 5x5 heart Nonogram purely by deterministic line logic", () => {
  const rowClues = [[1, 1], [5], [5], [3], [1]];
  const colClues = [[2], [4], [4], [4], [2]];
  const res = solveNonogram(rowClues, colClues);
  assert.equal(res.contradiction, false);
  assert.equal(res.solved, true);
  assert.deepEqual(res.grid, [
    [0, 1, 0, 1, 0],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0],
  ]);
});

test("solves 5x5 all-on Lights Out board via GF(2) elimination", () => {
  const board = Array.from({ length: 5 }, () => new Array(5).fill(1));
  const presses = solveLightsOutGF2(board);
  assert.ok(presses, "5x5 all-on Lights Out must be solvable");
  // Simulate applying every press and verify all lights turn off
  const sim = board.map((r) => r.slice());
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (!presses[r][c]) continue;
      for (const [dr, dc] of [[0,0],[-1,0],[1,0],[0,-1],[0,1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5) sim[nr][nc] ^= 1;
      }
    }
  }
  assert.deepEqual(sim, Array.from({ length: 5 }, () => new Array(5).fill(0)));
});
