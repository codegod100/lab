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
  console.log("startGame() called"); // Add log
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
        <button id="play-again-button">Play Again</button>
    `;
  container.appendChild(winMessage);
  winMessage.style.display = "none"; // Hide win message initially

  // Add event listener to the play again button
  const playAgainButton = document.getElementById("play-again-button");
  playAgainButton.addEventListener("click", () => {
    startGame();
  });


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
  const container = document.getElementById("puzzle-container");
  const pieceWidth = container.clientWidth / gridSize;
  const pieceHeight = container.clientHeight / gridSize;

  const piece = document.createElement("div");
  piece.className = "puzzle-piece";
  piece.style.width = pieceWidth + "px";
  piece.style.height = pieceHeight + "px";
  piece.style.backgroundImage = `url(${images[currentImage]})`;
  
   // Calculate background position using percentages
   const xPercent = (col * pieceWidth / container.clientWidth) * -100;
   const yPercent = (row * pieceHeight / container.clientHeight) * -100;
   piece.style.backgroundPosition = `${xPercent}% ${yPercent}%`;

   // Store original position as numbers instead of strings
   piece.dataset.originalRow = row.toString();
   piece.dataset.originalCol = col.toString();

   // Position in the grid
   movePieceTo(piece, row, col);

   // Add click event listener with passive option for better scrolling
   piece.addEventListener("click", () => handlePieceClick(piece), { passive: true });

   // Add to DOM and pieces array
   container.appendChild(piece);
   pieces.push(piece);
}

// Handle piece click with proper validation
function handlePieceClick(piece) {
    console.log("handlePieceClick() called", piece); // Add log
    if (!gameStarted) return;
    
    const pieceRow = parseInt(piece.dataset.row);
    const pieceCol = parseInt(piece.dataset.col);
    
    if (isAdjacent(pieceRow, pieceCol, emptyCell.row, emptyCell.col)) {
        swapPieces(piece);
        checkWin();
    }
}

// Swap pieces properly with animation frame
function swapPieces(piece) {
  console.log("swapPieces() called", piece); // Add log
    const tempRow = emptyCell.row;
    const tempCol = emptyCell.col;
    
    requestAnimationFrame(() => {
        movePieceTo(piece, emptyCell.row, emptyCell.col);
        emptyCell.row = parseInt(piece.dataset.row);
        emptyCell.col = parseInt(piece.dataset.col);
        
        moveCount++;
        updateMoveCounter();
    });
}

// Move a piece to a specific position with proper units
function movePieceTo(piece, row, col) {
    const container = document.getElementById("puzzle-container");
    const pieceWidthPercentage = (100 / gridSize).toFixed(2);
    const leftPositionPercentage = (col * (100 / gridSize)).toFixed(2);
    const topPositionPercentage = (row * (100 / gridSize)).toFixed(2);

    piece.style.left = `${leftPositionPercentage}%`;
    piece.style.top = `${topPositionPercentage}%`;
    piece.style.transform = `translate(0%, 0%)`; // Reset any transforms
    
    // Update data attributes as numbers
    piece.dataset.row = row.toString();
    piece.dataset.col = col.toString();
}

// Shuffle puzzle with valid moves only
function shufflePuzzle() {
  console.log("shufflePuzzle() called"); // Add log
    // Perform random valid moves to shuffle
    const shuffleMoves = gridSize * gridSize * Math.max(gridSize * 10);

    for (let i = 0; i < shuffleMoves; i++) {
        const adjacentCells = getAdjacentCells(emptyCell.row, emptyCell.col);

        if (adjacentCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * adjacentCells.length);
            const targetCell = adjacentCells[randomIndex];
            const targetPiece = findPieceAt(targetCell.row, targetCell.col);

            if (targetPiece) {
                swapPieces(targetPiece);
            }
        }
    }
}

// Get valid adjacent cells helper function
function getAdjacentCells(row,col) {
    return [
        {row:row-1,col:col},
        {row:row+1,col:col},
        {row:row,col:col-1},
        {row:row,col:col+1}
    ].filter(pos => 
        pos.row >=0 && pos.row <gridSize &&
        pos.col >=0 && pos.col <gridSize
    );
}

// Check if two positions are adjacent 
function isAdjacent(row1,col1,row2,col2) {
    return (
        Math.abs(row1-row2)+Math.abs(col1-col2) ===1 
    );
}

// Update move counter display safely
function updateMoveCounter() {
    const movesElement=document.getElementById("moves");
    if(movesElement) movesElement.textContent=moveCount;
}

// Check win condition properly 
function checkWin() {
  console.log("checkWin() called"); // Add log
    let allCorrect=true;
    
    for(const piece of pieces){
        const currentRow=parseInt(piece.dataset.row);
        const currentCol=parseInt(piece.dataset.col);
        const originalRow=parseInt(piece.dataset.originalRow);
        const originalCol=parseInt(piece.dataset.originalCol);
        
        if(currentRow!==originalRow || currentCol!==originalCol){
            allCorrect=false;
            break;
        }
        
        // Additional check for correct background position 
        const expectedLeft=(originalCol*(100/gridSize)).toFixed(2)+"%";
        const expectedTop=(originalRow*(100/gridSize)).toFixed(2)+"%";
        
        if(
            parseFloat(piece.style.left)!==parseFloat(expectedLeft) ||
            parseFloat(piece.style.top)!==parseFloat(expectedTop)
        ){
            allCorrect=false;
            break;
        }
    }
    
     // Verify empty cell position last 
     const emptyCorrect=
         emptyCell.row===gridSize-1 &&
         emptyCell.col===gridSize-1;

     if(allCorrect&&emptyCorrect){
         document.getElementById("win-message").style.display="flex";
         document.getElementById("final-moves").textContent=moveCount;
         gameStarted=false;
     }
}

// Find a piece at position with validation 
function findPieceAt(row,col){
     return pieces.find(p=>{
         try{
             return parseInt(p.dataset.row)===row&&parseInt(p.dataset.col)===col;
         }catch(e){
             console.error("Invalid dataset values",p.dataset);
             return false;
         }
     });
}
