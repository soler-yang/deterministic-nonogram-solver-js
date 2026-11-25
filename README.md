# deterministic-nonogram-solver-js

Zero-dependency pure ESM JavaScript solvers for **deterministic line-logic Nonograms (Picross)** and **exact $\text{GF}(2)$ Lights Out** boards — extracted from the puzzle verification engine behind [**Puzzle Fern**](https://puzzlefern.com/) (a free, ad-free browser arcade of 24 daily logic, number, and word games).

## Live Interactive Demos & Guides

- **Play 24 Free Browser Logic Puzzles:** https://puzzlefern.com/
- **Interactive Nonogram Solver & Line-Logic Guide:** https://puzzlefern.com/nonogram-solver/
- **Lights Out GF(2) Strategy & Interactive Board:** https://puzzlefern.com/lights-out/
- **Full Puzzle Strategy Guides:** https://puzzlefern.com/guides/

## Why Deterministic Solvers Matter for Puzzle Design

When generating daily browser puzzles, brute-force backtracking accepts grids that require human players to guess. Running `solveNonogram()` as a build-time generator gate guarantees every published puzzle is **100% logically deducible line-by-line** with zero guessing.

Similarly, `solveLightsOutGF2()` performs exact Gaussian elimination over $\mathbb{F}_2$ to verify solvability and compute exact solutions for any rectangular Lights Out board in microseconds.

## Quick Usage

```js
import { solveNonogram, solveLightsOutGF2 } from "./src/index.mjs";

const nonogram = solveNonogram(
  [[1, 1], [5], [5], [3], [1]],
  [[2], [4], [4], [4], [2]]
);
console.log(nonogram.solved, nonogram.iterations, nonogram.grid);

const lightsOut = solveLightsOutGF2([
  [1, 1, 1],
  [1, 1, 1],
  [1, 1, 1],
]);
console.log(lightsOut);
```

## Run Tests

```bash
npm test
```

## License

MIT — built by Rocky Yang (`rockyyang`).
