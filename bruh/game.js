// Game configuration
let gridSize = 3; // Default 3x3
let pieces = [];
let emptyCell = { row: gridSize - 1, col: gridSize - 1 };
let moveCount = 0;
let gameStarted = false;

// Cute bunny images
const images = [
  "https://img.freepik.com/free-vector/cute-rabbit-with-carrot-cartoon-vector-icon-illustration_138676-7857.jpg",
];
let currentImage = 0;

// Initialize the game
window.onload = function () {
  setDifficulty(gridSize);
};

// Set difficulty level
function setDifficulty(size) {
  gridSize = size;
  startGame();
}

// Start a new game
function startGame() {
  // Reset variables
  moveCount = 0;
  updateMoveCounter();
  emptyCell = { row: gridSize - 1, col: gridSize - 1 };

  // Clear the puzzle container
  const container = document.getElementById("puzzle-container");
  container.innerHTML = "";

  // Add the win message back (it was cleared)
  const winMessage = document.createElement("div");
  winMessage.className = "win-message";
  winMessage.id = "win-message";
  winMessage.innerHTML = `
        <h2>You did it! 🎉</h2>
        <p>You solved the puzzle in <span id="final-moves">0</span> moves!</p>
        <button onclick="startGame()">Play Again</button>
    `;
  container.appendChild(winMessage);
  winMessage.style.display = "none"; // Hide win message initially

  // Rotate through the available images
  currentImage = (currentImage + 1) % images.length;

  // Create new puzzle pieces
  pieces = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (row === gridSize - 1 && col === gridSize - 1) {
        // Skip the empty cell
        continue;
      }

      createPiece(row, col);
    }
  }

  // Shuffle pieces (ensure it's solvable)
  shufflePuzzle();

  // Mark game as started
  gameStarted = true;
}

// Create a single puzzle piece
function createPiece(row, col) {
  const pieceWidth = 400 / gridSize;
  const pieceHeight = 400 / gridSize;

  const piece = document.createElement("div");
  piece.className = "puzzle-piece";
  piece.style.width = pieceWidth + "px";
  piece.style.height = pieceHeight + "px";
  piece.style.backgroundImage = `url(${images[currentImage]})`;
  piece.style.backgroundPosition = `-${col * pieceWidth}px -${row * pieceHeight}px`;

  // Store the original position for checking win condition
  piece.dataset.originalRow = row;
  piece.dataset.originalCol = col;

  // Position in the grid
  movePieceTo(piece, row, col);

  // Add click event
  piece.addEventListener("click", () => {
    if (!gameStarted) return;

    const pieceRow = parseInt(piece.dataset.row);
    const pieceCol = parseInt(piece.dataset.col);

    // Check if it's adjacent to the empty cell
    if (isAdjacent(pieceRow, pieceCol, emptyCell.row, emptyCell.col)) {
      // Swap positions
      movePieceTo(piece, emptyCell.row, emptyCell.col);

      // Update empty cell position
      emptyCell.row = pieceRow;
      emptyCell.col = pieceCol;

      // Update move counter
      moveCount++;
      updateMoveCounter();

      // Check if puzzle is solved
      checkWin();
    }
  });

  // Add to DOM and pieces array
  document.getElementById("puzzle-container").appendChild(piece);
  pieces.push(piece);
}

// Move a piece to a specific position
function movePieceTo(piece, row, col) {
  const pieceWidth = 400 / gridSize;
  const pieceHeight = 400 / gridSize;

  piece.style.left = col * pieceWidth + "px";
  piece.style.top = row * pieceHeight + "px";

  // Update data attributes
  piece.dataset.row = row;
  piece.dataset.col = col;
}

// Check if two positions are adjacent
function isAdjacent(row1, col1, row2, col2) {
  return (
    (row1 === row2 && Math.abs(col1 - col2) === 1) ||
    (col1 === col2 && Math.abs(row1 - row2) === 1)
  );
}

// Update the move counter display
function updateMoveCounter() {
  document.getElementById("moves").textContent = moveCount;
}

// Check if the puzzle is solved
function checkWin() {
    // Verify all pieces are in their original positions AND empty cell is in bottom-right corner
    const allCorrect = pieces.every(piece => {
        const currentRow = parseInt(piece.dataset.row);
        const currentCol = parseInt(piece.dataset.col);
        const originalRow = parseInt(piece.dataset.originalRow);
        const originalCol = parseInt(piece.dataset.originalCol);
        return currentRow === originalRow && currentCol === originalCol;
    });

    const emptyCorrectPosition =
        emptyCell.row === gridSize -1 &&
        emptyCell.col === gridSize -1;

    if (allCorrect && emptyCorrectPosition) {
        document.getElementById("win-message").style.display = "flex";
        document.getElementById("final-moves").textContent = moveCount;
        gameStarted = false;
    }
}

// Find a piece at a specific position
function findPieceAt(row, col) {
    return pieces.find(piece => 
        parseInt(piece.dataset.row) === row &&
        parseInt(piece.dataset.col) === col
    );
}
