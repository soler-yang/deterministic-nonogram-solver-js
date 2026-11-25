/**
 * Deterministic Nonogram line-logic solver + GF(2) Lights Out solver.
 * Cell states: -1 = unknown, 0 = empty, 1 = filled.
 * Live interactive editions: https://puzzlefern.com/nonogram-solver/
 */

function generateValidLines(clues, cells) {
  const n = cells.length;
  const activeClues = clues.filter((c) => c > 0);
  if (activeClues.length === 0) {
    return cells.some((c) => c === 1) ? [] : [new Array(n).fill(0)];
  }
  const results = [];
  const suffixMin = new Array(activeClues.length + 1).fill(0);
  for (let i = activeClues.length - 1; i >= 0; i--) {
    suffixMin[i] = activeClues[i] + (i < activeClues.length - 1 ? 1 + suffixMin[i + 1] : 0);
  }
  const line = new Array(n).fill(0);

  function place(clueIdx, start) {
    if (clueIdx === activeClues.length) {
      for (let i = start; i < n; i++) {
        if (cells[i] === 1) return;
      }
      results.push(line.slice());
      return;
    }
    const len = activeClues[clueIdx];
    const maxStart = n - suffixMin[clueIdx];
    for (let pos = start; pos <= maxStart; pos++) {
      // Preceding gap cannot overwrite known filled cells
      if (pos > start && cells[pos - 1] === 1) break;
      let ok = true;
      for (let k = 0; k < len; k++) {
        if (cells[pos + k] === 0) {
          ok = false;
          break;
        }
      }
      if (ok && pos + len < n && cells[pos + len] === 1) ok = false;
      if (!ok) continue;

      for (let k = 0; k < len; k++) line[pos + k] = 1;
      const nextStart = pos + len + (clueIdx < activeClues.length - 1 ? 1 : 0);
      place(clueIdx + 1, nextStart);
      for (let k = 0; k < len; k++) line[pos + k] = 0;
    }
  }

  place(0, 0);
  return results;
}

export function solveNonogramLine(clues, cells) {
  const valid = generateValidLines(clues, cells);
  if (valid.length === 0) return { contradiction: true, next: cells.slice(), changed: false };
  const next = cells.slice();
  let changed = false;
  for (let i = 0; i < cells.length; i++) {
    if (next[i] !== -1) continue;
    const first = valid[0][i];
    let same = true;
    for (let j = 1; j < valid.length; j++) {
      if (valid[j][i] !== first) {
        same = false;
        break;
      }
    }
    if (same) {
      next[i] = first;
      changed = true;
    }
  }
  return { contradiction: false, next, changed };
}

export function solveNonogram(rowClues, colClues) {
  const rows = rowClues.length;
  const cols = colClues.length;
  const grid = Array.from({ length: rows }, () => new Array(cols).fill(-1));
  let iterations = 0;
  let progress = true;

  while (progress) {
    progress = false;
    iterations++;
    for (let r = 0; r < rows; r++) {
      const res = solveNonogramLine(rowClues[r], grid[r]);
      if (res.contradiction) return { solved: false, contradiction: true, iterations, grid };
      if (res.changed) {
        grid[r] = res.next;
        progress = true;
      }
    }
    for (let c = 0; c < cols; c++) {
      const col = Array.from({ length: rows }, (_, r) => grid[r][c]);
      const res = solveNonogramLine(colClues[c], col);
      if (res.contradiction) return { solved: false, contradiction: true, iterations, grid };
      if (res.changed) {
        for (let r = 0; r < rows; r++) grid[r][c] = res.next[r];
        progress = true;
      }
    }
  }
  const solved = grid.every((row) => row.every((cell) => cell !== -1));
  return { solved, contradiction: false, iterations, grid };
}

/**
 * Exact GF(2) Gaussian elimination solver for N x M Lights Out boards.
 * Input: 2D array of 0 (off) and 1 (on). Returns 2D press matrix (0/1) or null if unsolvable.
 */
export function solveLightsOutGF2(board) {
  const rows = board.length;
  const cols = board[0].length;
  const n = rows * cols;
  const mat = Array.from({ length: n }, () => new Uint8Array(n + 1));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const neighbors = [
        [r, c],
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ];
      for (const [nr, nc] of neighbors) {
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          mat[idx][nr * cols + nc] = 1;
        }
      }
      mat[idx][n] = board[r][c] ? 1 : 0;
    }
  }

  let pivotRow = 0;
  const pivotColForRow = new Array(n).fill(-1);
  for (let col = 0; col < n && pivotRow < n; col++) {
    let sel = -1;
    for (let r = pivotRow; r < n; r++) {
      if (mat[r][col] === 1) {
        sel = r;
        break;
      }
    }
    if (sel === -1) continue;
    [mat[pivotRow], mat[sel]] = [mat[sel], mat[pivotRow]];
    pivotColForRow[pivotRow] = col;
    for (let r = 0; r < n; r++) {
      if (r !== pivotRow && mat[r][col] === 1) {
        for (let k = col; k <= n; k++) mat[r][k] ^= mat[pivotRow][k];
      }
    }
    pivotRow++;
  }

  for (let r = pivotRow; r < n; r++) {
    if (mat[r][n] === 1) return null;
  }

  const sol = new Uint8Array(n);
  for (let r = 0; r < pivotRow; r++) {
    sol[pivotColForRow[r]] = mat[r][n];
  }
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => sol[r * cols + c])
  );
}
