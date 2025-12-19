function getRow(index) {
  return Math.floor(index / 9);
}

function getCol(index) {
  return index % 9;
}

function getBox(index) {
  const row = getRow(index);
  const col = getCol(index);
  return Math.floor(row / 3) * 3 + Math.floor(col / 3);
}

function isValid(board, index, num) {
  const row = getRow(index);
  const col = getCol(index);
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;

  for (let i = 0; i < 9; i++) {
    if (board[row * 9 + i] === num) return false;
    if (board[i * 9 + col] === num) return false;
    if (
      board[(startRow + Math.floor(i / 3)) * 9 + (startCol + (i % 3))] === num
    )
      return false;
  }
  return true;
}

function fillDiagonal(board) {
  for (let i = 0; i < 9; i = i + 3) {
    fillBox(board, i * 9 + i);
  }
}

function fillBox(board, startNode) {
  let num;
  const row = getRow(startNode);
  const col = getCol(startNode);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      do {
        num = Math.floor(Math.random() * 9) + 1;
      } while (!isSafeInBox(board, row, col, num));
      board[(row + i) * 9 + (col + j)] = num;
    }
  }
}

function isSafeInBox(board, row, col, num) {
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[(startRow + i) * 9 + (startCol + j)] === num) return false;
    }
  }
  return true;
}

function solveSudoku(board) {
  for (let i = 0; i < 81; i++) {
    if (board[i] === 0) {
      for (let num = 1; num <= 9; num++) {
        if (isValid(board, i, num)) {
          board[i] = num;
          if (solveSudoku(board)) return true;
          board[i] = 0;
        }
      }
      return false;
    }
  }
  return true;
}

exports.generateSudoku = function (difficulty) {
  const boardArray = new Array(81).fill(0);
  fillDiagonal(boardArray);
  solveSudoku(boardArray);
  const solution = [...boardArray];

  // Determine difficulty
  let removeCount = 20;
  if (difficulty === "Easy") removeCount = 30;
  if (difficulty === "Medium") removeCount = 45;
  if (difficulty === "Hard") removeCount = 55;
  if (difficulty === "Daily") {
    const date = new Date().getDate();
    removeCount = 40 + (date % 10);
  }

  // Remove cells
  let attempts = 0;
  while (attempts < removeCount) {
    const idx = Math.floor(Math.random() * 81);
    if (boardArray[idx] !== 0) {
      boardArray[idx] = 0;
      attempts++;
    }
  }

  // Format for frontend
  return boardArray.map((val, index) => ({
    id: index,
    row: getRow(index),
    col: getCol(index),
    value: val === 0 ? null : val,
    solution: solution[index],
    isFixed: val !== 0,
    notes: [],
    isError: false,
    isHinted: false,
  }));
};
