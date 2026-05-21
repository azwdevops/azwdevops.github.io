const DIFFICULTY = {
  easy: { clues: 40 },
  medium: { clues: 32 },
  hard: { clues: 26 },
};

const MAX_MISTAKES = 10;

class SudokuGame {
  constructor() {
    this.board = Array.from({ length: 9 }, () => Array(9).fill(0));
    this.puzzle = Array.from({ length: 9 }, () => Array(9).fill(0));
    this.solution = Array.from({ length: 9 }, () => Array(9).fill(0));
    this.given = Array.from({ length: 9 }, () => Array(9).fill(false));
    this.selected = null;
    this.mistakes = 0;
    this.timerSeconds = 0;
    this.timerId = null;
    this.gameOver = false;

    this.boardEl = document.getElementById("board");
    this.printAreaEl = document.getElementById("printArea");
    this.printBoardEl = document.getElementById("printBoard");
    this.containerEl = document.querySelector(".container");
    this.numpadEl = document.getElementById("numpad");
    this.timerEl = document.getElementById("timer");
    this.mistakesEl = document.getElementById("mistakes");
    this.messageEl = document.getElementById("message");
    this.difficultyEl = document.getElementById("difficulty");

    this.buildNumpad();
    this.bindEvents();
    this.newGame();
  }

  buildNumpad() {
    this.numpadEl.innerHTML = "";
    for (let n = 1; n <= 9; n++) {
      const btn = document.createElement("button");
      btn.className = "numpad-btn";
      btn.textContent = n;
      btn.dataset.value = n;
      btn.addEventListener("click", () => this.setValue(n));
      this.numpadEl.appendChild(btn);
    }
  }

  bindEvents() {
    document.getElementById("newGameBtn").addEventListener("click", () => this.newGame());
    document.getElementById("eraseBtn").addEventListener("click", () => this.erase());
    document.getElementById("printBtn").addEventListener("click", () => this.printGrid());
    document.getElementById("hintBtn").addEventListener("click", () => this.giveHint());
    document.getElementById("checkBtn").addEventListener("click", () => this.checkBoard());

    document.addEventListener("keydown", (e) => {
      if (this.gameOver) return;

      if (e.key >= "1" && e.key <= "9") {
        this.setValue(Number(e.key));
      } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        this.erase();
      } else if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        this.moveSelection(e.key);
      }
    });
  }

  newGame() {
    this.stopTimer();
    this.mistakes = 0;
    this.timerSeconds = 0;
    this.selected = null;
    this.gameOver = false;
    this.updateStats();
    this.setMessage("");

    const difficulty = this.difficultyEl.value;
    const puzzle = generatePuzzle(DIFFICULTY[difficulty].clues);

    this.board = puzzle.puzzle.map((row) => [...row]);
    this.puzzle = puzzle.puzzle.map((row) => [...row]);
    this.solution = puzzle.solution.map((row) => [...row]);
    this.given = puzzle.puzzle.map((row) => row.map((cell) => cell !== 0));

    this.renderBoard();
    this.renderPrintBoard();
    this.startTimer();
  }

  renderBoard() {
    this.boardEl.innerHTML = "";

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.row = row;
        cell.dataset.col = col;

        if ((col + 1) % 3 === 0 && col < 8) cell.classList.add("border-right");
        if ((row + 1) % 3 === 0 && row < 8) cell.classList.add("border-bottom");

        const value = this.board[row][col];
        cell.textContent = value !== 0 ? value : "\u00a0";

        if (this.given[row][col]) {
          cell.classList.add("given");
        } else {
          cell.addEventListener("click", () => this.selectCell(row, col));
        }

        this.boardEl.appendChild(cell);
      }
    }

    this.updateHighlights();
  }

  getPrintCellStyles(row, col, hasNumber) {
    const cellSize = 28;
    const thin = "1px solid #999999";
    const thick = "2px solid #000000";
    const backgroundColor = hasNumber ? "#f0f2ff" : "#ffffff";

    return [
      "width: " + cellSize + "px",
      "height: " + cellSize + "px",
      "min-width: " + cellSize + "px",
      "max-width: " + cellSize + "px",
      "min-height: " + cellSize + "px",
      "max-height: " + cellSize + "px",
      "padding: 0",
      "margin: 0",
      "text-align: center",
      "vertical-align: middle",
      "line-height: " + cellSize + "px",
      "background-color: " + backgroundColor,
      "color: #000000",
      "font-size: 16px",
      "font-weight: 700",
      "font-family: Arial, sans-serif",
      "box-sizing: border-box",
      "overflow: hidden",
      "border-top: " + (row % 3 === 0 ? thick : thin),
      "border-left: " + (col % 3 === 0 ? thick : thin),
      "border-bottom: " + ((row + 1) % 3 === 0 ? thick : thin),
      "border-right: " + ((col + 1) % 3 === 0 ? thick : thin),
      "-webkit-print-color-adjust: exact",
      "print-color-adjust: exact",
    ].join("; ");
  }

  renderPrintBoard() {
    const cellSize = 28;

    this.printBoardEl.style.cssText = [
      "margin: 0",
      "padding: 0",
      "-webkit-print-color-adjust: exact",
      "print-color-adjust: exact",
    ].join("; ");

    const table = document.createElement("table");
    table.setAttribute("cellspacing", "0");
    table.setAttribute("cellpadding", "0");
    table.style.cssText = [
      "border-collapse: collapse",
      "table-layout: fixed",
      "width: " + (cellSize * 9 + 4) + "px",
      "height: " + (cellSize * 9 + 4) + "px",
      "margin: 0",
      "padding: 0",
      "border: 2px solid #000000",
      "background-color: #ffffff",
      "-webkit-print-color-adjust: exact",
      "print-color-adjust: exact",
    ].join("; ");

    const colgroup = document.createElement("colgroup");
    for (let i = 0; i < 9; i++) {
      const col = document.createElement("col");
      col.style.cssText = "width: " + cellSize + "px; min-width: " + cellSize + "px; max-width: " + cellSize + "px;";
      colgroup.appendChild(col);
    }
    table.appendChild(colgroup);

    for (let row = 0; row < 9; row++) {
      const tr = document.createElement("tr");
      tr.style.cssText = [
        "height: " + cellSize + "px",
        "margin: 0",
        "padding: 0",
        "border: none",
      ].join("; ");

      for (let col = 0; col < 9; col++) {
        const td = document.createElement("td");
        const value = this.puzzle[row][col];
        const hasNumber = value !== 0;

        td.style.cssText = this.getPrintCellStyles(row, col, hasNumber);
        td.textContent = hasNumber ? value : "\u00a0";

        tr.appendChild(td);
      }

      table.appendChild(tr);
    }

    this.printBoardEl.innerHTML = "";
    this.printBoardEl.appendChild(table);
  }

  printGrid() {
    this.renderPrintBoard();

    const printStyle = document.createElement("style");
    printStyle.id = "sudoku-print-style";
    printStyle.textContent = "@page { margin: 2mm; }";

    const saved = {
      printArea: this.printAreaEl.style.cssText,
      printBoard: this.printBoardEl.style.cssText,
      container: this.containerEl.style.cssText,
      body: document.body.style.cssText,
    };

    document.head.appendChild(printStyle);
    document.body.style.cssText = "margin: 0; padding: 0; background-color: #ffffff;";
    this.containerEl.style.cssText = "display: none;";
    this.printAreaEl.style.cssText = [
      "display: block",
      "position: fixed",
      "top: 0",
      "left: 0",
      "margin: 0",
      "padding: 2mm",
      "background-color: #ffffff",
      "-webkit-print-color-adjust: exact",
      "print-color-adjust: exact",
    ].join("; ");

    window.addEventListener(
      "afterprint",
      () => {
        printStyle.remove();
        this.printAreaEl.style.cssText = saved.printArea;
        this.printBoardEl.style.cssText = saved.printBoard;
        this.containerEl.style.cssText = saved.container;
        document.body.style.cssText = saved.body;
      },
      { once: true }
    );

    window.print();
  }

  selectCell(row, col) {
    if (this.gameOver || this.given[row][col]) return;
    this.selected = { row, col };
    this.updateHighlights();
  }

  moveSelection(key) {
    if (!this.selected) {
      this.selectCell(0, 0);
      return;
    }

    let { row, col } = this.selected;

    if (key === "ArrowUp") row = Math.max(0, row - 1);
    if (key === "ArrowDown") row = Math.min(8, row + 1);
    if (key === "ArrowLeft") col = Math.max(0, col - 1);
    if (key === "ArrowRight") col = Math.min(8, col + 1);

    this.selectCell(row, col);
  }

  getCellEl(row, col) {
    return this.boardEl.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  }

  updateHighlights() {
    const cells = this.boardEl.querySelectorAll(".cell");
    cells.forEach((cell) => {
      cell.classList.remove("selected", "related", "same-value", "error");
    });

    if (!this.selected) return;

    const { row, col } = this.selected;
    const selectedValue = this.board[row][col];
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = this.getCellEl(r, c);
        const isSelected = r === row && c === col;
        const isRelated = r === row || c === col || (r >= boxRow && r < boxRow + 3 && c >= boxCol && c < boxCol + 3);
        const isSameValue = selectedValue !== 0 && this.board[r][c] === selectedValue;

        if (isSelected) cell.classList.add("selected");
        else if (isSameValue) cell.classList.add("same-value");
        else if (isRelated) cell.classList.add("related");

        if (!this.given[r][c] && this.board[r][c] !== 0 && this.board[r][c] !== this.solution[r][c]) {
          cell.classList.add("error");
        }
      }
    }
  }

  setValue(value) {
    if (this.gameOver || !this.selected) return;

    const { row, col } = this.selected;
    if (this.given[row][col]) return;

    this.board[row][col] = value;
    this.getCellEl(row, col).textContent = value;
    this.updateHighlights();

    if (value !== this.solution[row][col]) {
      this.mistakes++;
      this.updateStats();
      this.setMessage("Incorrect number", "error");

      if (this.mistakes >= MAX_MISTAKES) {
        this.endGame(false);
      }
    } else {
      this.setMessage("");
      if (this.isComplete()) {
        this.endGame(true);
      }
    }
  }

  erase() {
    if (this.gameOver || !this.selected) return;

    const { row, col } = this.selected;
    if (this.given[row][col]) return;

    this.board[row][col] = 0;
    this.getCellEl(row, col).textContent = "\u00a0";
    this.updateHighlights();
    this.setMessage("");
  }

  giveHint() {
    if (this.gameOver) return;

    const emptyCells = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (!this.given[row][col] && this.board[row][col] === 0) {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length === 0) return;

    const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    this.selectCell(row, col);
    this.board[row][col] = this.solution[row][col];
    this.getCellEl(row, col).textContent = this.solution[row][col];
    this.updateHighlights();
    this.setMessage("Hint used", "success");

    if (this.isComplete()) {
      this.endGame(true);
    }
  }

  checkBoard() {
    if (this.gameOver) return;

    let hasEmpty = false;
    let hasError = false;

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (!this.given[row][col] && this.board[row][col] === 0) {
          hasEmpty = true;
        } else if (!this.given[row][col] && this.board[row][col] !== this.solution[row][col]) {
          hasError = true;
        }
      }
    }

    this.updateHighlights();

    if (hasError) {
      this.setMessage("Some entries are wrong", "error");
    } else if (hasEmpty) {
      this.setMessage("Keep going, grid is not full yet");
    } else {
      this.endGame(true);
    }
  }

  isComplete() {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.board[row][col] !== this.solution[row][col]) {
          return false;
        }
      }
    }
    return true;
  }

  endGame(won) {
    this.gameOver = true;
    this.stopTimer();

    if (won) {
      this.setMessage(`You win in ${this.formatTime(this.timerSeconds)}!`, "success");
    } else {
      this.setMessage("Game over. Try a new puzzle.", "error");
    }
  }

  startTimer() {
    this.timerEl.textContent = "00:00";
    this.timerId = setInterval(() => {
      this.timerSeconds++;
      this.timerEl.textContent = this.formatTime(this.timerSeconds);
    }, 1000);
  }

  stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  updateStats() {
    this.mistakesEl.textContent = `${this.mistakes} / ${MAX_MISTAKES}`;
  }

  formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  setMessage(text, type = "") {
    this.messageEl.textContent = text;
    this.messageEl.className = "message";
    if (type) this.messageEl.classList.add(type);
  }
}

function createEmptyBoard() {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function isValid(board, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num || board[i][col] === num) return false;
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }

  return true;
}

function fillBoard(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function countSolutions(board, limit = 2) {
  let solutions = 0;

  function solve() {
    if (solutions >= limit) return;

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              solve();
              board[row][col] = 0;
            }
          }
          return;
        }
      }
    }
    solutions++;
  }

  solve();
  return solutions;
}

function generatePuzzle(clueCount) {
  const solution = createEmptyBoard();
  fillBoard(solution);

  const puzzle = solution.map((row) => [...row]);
  const cells = [];

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      cells.push({ row, col });
    }
  }

  shuffle(cells);

  let removed = 0;
  const targetRemoved = 81 - clueCount;

  for (const { row, col } of cells) {
    if (removed >= targetRemoved) break;

    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    const testBoard = puzzle.map((r) => [...r]);
    if (countSolutions(testBoard, 2) === 1) {
      removed++;
    } else {
      puzzle[row][col] = backup;
    }
  }

  return { puzzle, solution };
}

document.addEventListener("DOMContentLoaded", () => {
  new SudokuGame();
});
