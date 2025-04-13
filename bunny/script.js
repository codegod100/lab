const boardSize = 4;
const tileSize = 100;
const gameBoard = document.getElementById("game-board");
const bunnyImage = "bunny.png";

let board = [];
let emptyTile = { x: 3, y: 3 };

function createBoard() {
  board = Array.from({ length: boardSize }, (_, y) =>
    Array.from({ length: boardSize }, (_, x) =>
      y === 3 && x === 3 ? 0 : y * boardSize + x + 1,
    ),
  );
  shuffleBoard();
  drawBoard(); // Ensure the board is drawn after shuffling
}

function shuffleBoard() {
  for (let i = boardSize * boardSize - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [
      board[Math.floor(i / boardSize)][i % boardSize],
      board[Math.floor(j / boardSize)][j % boardSize],
    ] = [
      board[Math.floor(j / boardSize)][j % boardSize],
      board[Math.floor(i / boardSize)][i % boardSize],
    ];
  }
  emptyTile = findEmptyTile();
}

function findEmptyTile() {
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      if (board[y][x] === 0) {
        return { x, y };
      }
    }
  }
  return { x: 3, y: 3 };
}

function drawBoard() {
  gameBoard.innerHTML = "";
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      if (board[y][x] === 0) {
        tile.classList.add("empty");
      } else {
        tile.style.backgroundImage = `url(${bunnyImage})`;
        tile.style.backgroundPosition = `-${(board[y][x] - 1) % boardSize * tileSize}px -${Math.floor((board[y][x] - 1) / boardSize) * tileSize}px`;
      }
      tile.dataset.x = x;
      tile.dataset.y = y;
      tile.addEventListener("click", moveTile);
      gameBoard.appendChild(tile);
    }
  }
}

function moveTile(event) {
  const tile = event.target;
  const x = parseInt(tile.dataset.x);
  const y = parseInt(tile.dataset.y);

  if (
    (Math.abs(x - emptyTile.x) === 1 && y === emptyTile.y) ||
    (Math.abs(y - emptyTile.y) === 1 && x === emptyTile.x)
  ) {
    const temp = board[y][x];
    board[y][x] = board[emptyTile.y][emptyTile.x];
    board[emptyTile.y][emptyTile.x] = temp;

    // Swap the tiles visually
    const emptyTileElement = document.querySelector(`.tile[data-x="${emptyTile.x}"][data-y="${emptyTile.y}"]`);
    const tileElement = document.querySelector(`.tile[data-x="${x}"][data-y="${y}"]`);

    // Update the background position for the tile
    tileElement.style.backgroundPosition = `-${(board[y][x] - 1) % boardSize * tileSize}px -${Math.floor((board[y][x] - 1) / boardSize) * tileSize}px`;

    // Update the background position for the empty tile
    emptyTileElement.style.backgroundPosition = `-${(board[emptyTile.y][emptyTile.x] - 1) % boardSize * tileSize}px -${Math.floor((board[emptyTile.y][emptyTile.x] - 1) / boardSize) * tileSize}px`;

    // Swap the data-x and data-y attributes
    const tempDataX = tileElement.dataset.x;
    const tempDataY = tileElement.dataset.y;

    tileElement.dataset.x = emptyTileElement.dataset.x;
    tileElement.dataset.y = emptyTileElement.dataset.y;

    emptyTileElement.dataset.x = tempDataX;
    emptyTileElement.dataset.y = tempDataY;

    // Swap the classes to update the empty tile
    tileElement.classList.remove("empty");
    emptyTileElement.classList.add("empty");

    // Swap the tiles in the DOM
    const tempParent = tileElement.parentNode;
    const tempNextSibling = tileElement.nextSibling;

    if (tempNextSibling === emptyTileElement) {
      emptyTileElement.parentNode.insertBefore(tileElement, emptyTileElement.nextSibling);
    } else {
      emptyTileElement.parentNode.insertBefore(tileElement, emptyTileElement);
    }

    if (tempNextSibling) {
      tempParent.insertBefore(emptyTileElement, tempNextSibling);
    } else {
      tempParent.appendChild(emptyTileElement);
    }

    emptyTile = { x, y };
  }
}

function solvePuzzle() {
  const worker = new Worker('worker.js');

  worker.onmessage = function(e) {
    const path = e.data;
    if (path) {
      let currentBoard = JSON.parse(JSON.stringify(board));
      let currentEmptyTile = JSON.parse(JSON.stringify(emptyTile));

      for (let i = 1; i < path.length; i++) {
        const nextBoard = path[i];
        for (let y = 0; y < boardSize; y++) {
          for (let x = 0; x < boardSize; x++) {
            if (currentBoard[y][x] !== nextBoard[y][x]) {
              const tileElement = document.querySelector(`.tile[data-x="${x}"][data-y="${y}"]`);
              if (tileElement) {
                console.log(`Moving tile from (${x}, ${y}) to (${currentEmptyTile.x}, ${currentEmptyTile.y})`);
                moveTile({ target: tileElement });
                currentBoard = JSON.parse(JSON.stringify(board));
                currentEmptyTile = JSON.parse(JSON.stringify(emptyTile));
                break;
              }
            }
          }
        }
      }
    } else {
      console.log("No solution found");
    }
  };

  worker.postMessage({ board: board, emptyTile: emptyTile });
}

document.getElementById("solve-button").addEventListener("click", solvePuzzle);

createBoard();
drawBoard();
