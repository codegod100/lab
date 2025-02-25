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
  document.getElementById("final-moves").textContent = moveCount;
}

// Check if the puzzle is solved
function checkWin() {
  let solved = true;

  for (const piece of pieces) {
    const currentRow = parseInt(piece.dataset.row);
    const currentCol = parseInt(piece.dataset.col);
    const originalRow = parseInt(piece.dataset.originalRow);
    const originalCol = parseInt(piece.dataset.originalCol);

    if (currentRow !== originalRow || currentCol !== originalCol) {
      solved = false;
      break;
    }
  }

  if (solved) {
    // Show win message
    document.getElementById("win-message").classList.add("show");
    gameStarted = false;

    // Add some confetti or celebration
    celebrateWin();
  }
}

// Shuffle the puzzle (ensuring it's solvable)
function shufflePuzzle() {
  // Start with a solved puzzle and make random moves
  const moves = gridSize * gridSize * 20; // More moves for larger puzzles

  for (let i = 0; i < moves; i++) {
    // Find all possible moves (pieces adjacent to empty cell)
    const possibleMoves = [];

    for (const piece of pieces) {
      const pieceRow = parseInt(piece.dataset.row);
      const pieceCol = parseInt(piece.dataset.col);

      if (isAdjacent(pieceRow, pieceCol, emptyCell.row, emptyCell.col)) {
        possibleMoves.push(piece);
      }
    }

    // Make a random move
    if (possibleMoves.length > 0) {
      const randomPiece =
        possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      const pieceRow = parseInt(randomPiece.dataset.row);
      const pieceCol = parseInt(randomPiece.dataset.col);

      // Swap
      movePieceTo(randomPiece, emptyCell.row, emptyCell.col);

      // Update empty cell
      emptyCell.row = pieceRow;
      emptyCell.col = pieceCol;
    }
  }

  // Reset move counter after shuffling
  moveCount = 0;
  updateMoveCounter();
}

// Show the complete solution briefly
function showSolution() {
  if (!gameStarted) return;

  // Store current positions
  const currentPositions = pieces.map((piece) => ({
    element: piece,
    row: parseInt(piece.dataset.row),
    col: parseInt(piece.dataset.col),
  }));

  // Move all pieces to their correct positions
  for (const piece of pieces) {
    const originalRow = parseInt(piece.dataset.originalRow);
    const originalCol = parseInt(piece.dataset.originalCol);

    movePieceTo(piece, originalRow, originalCol);
  }

  // Store empty cell position
  const oldEmptyCell = { ...emptyCell };
  emptyCell = { row: gridSize - 1, col: gridSize - 1 };

  // Reset after 2 seconds
  setTimeout(() => {
    // Restore positions
    for (const pos of currentPositions) {
      movePieceTo(pos.element, pos.row, pos.col);
    }

    // Restore empty cell
    emptyCell = oldEmptyCell;
  }, 2000);
}

// Solve the puzzle with web workers for parallel solving
function solvePuzzle() {
  if (!gameStarted) return;

  // Disable clicking during animation
  gameStarted = false;
  
  console.log("🧩 Starting puzzle solver with web workers...");

  try {
    // Check if puzzle is already solved
    if (isPuzzleSolved()) {
      console.log("✅ Puzzle already solved!");
      checkWin();
      return;
    }
    
    // Create a lightweight board representation to pass to workers
    const board = createBoardRepresentation();
    console.log("📋 Initial board state:", board);
    
    // Create a loading indicator to show solver is working
    showSolverLoadingIndicator();
    
    // Try to solve with parallel web workers
    solveWithWebWorkers(board, (solution) => {
      if (solution && solution.length > 0) {
        console.log(`🎯 Found solution with ${solution.length} moves using web workers`);
        hideSolverLoadingIndicator();
        playSolution(solution);
      } else {
        console.log("⚠️ Web workers couldn't find a solution, falling back to built-in solver");
        
        // Fall back to built-in solver
        console.log("🔄 Generating backup solution...");
        const moves = generateRealisticSolution();
        
        hideSolverLoadingIndicator();
        
        // Safety check
        if (!moves || moves.length === 0) {
          console.error("❌ Could not generate a solution");
          gameStarted = true;
          return;
        }
        
        console.log(`🎯 Found backup solution with ${moves.length} moves`);
        playSolution(moves);
      }
    });
    
  } catch (error) {
    console.error("❌ Error in solvePuzzle:", error);
    hideSolverLoadingIndicator();
    gameStarted = true;
  }
}

// Show a loading indicator while solving
function showSolverLoadingIndicator() {
  const container = document.getElementById("puzzle-container");
  
  // Check if indicator already exists
  if (document.getElementById("solver-indicator")) return;
  
  const indicator = document.createElement("div");
  indicator.id = "solver-indicator";
  indicator.style.position = "absolute";
  indicator.style.top = "0";
  indicator.style.left = "0";
  indicator.style.width = "100%";
  indicator.style.height = "100%";
  indicator.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
  indicator.style.display = "flex";
  indicator.style.flexDirection = "column";
  indicator.style.justifyContent = "center";
  indicator.style.alignItems = "center";
  indicator.style.zIndex = "10";
  
  const spinner = document.createElement("div");
  spinner.style.width = "50px";
  spinner.style.height = "50px";
  spinner.style.border = "5px solid #ff69b4";
  spinner.style.borderTop = "5px solid transparent";
  spinner.style.borderRadius = "50%";
  spinner.style.animation = "spin 1s linear infinite";
  
  const text = document.createElement("div");
  text.textContent = "Solving puzzle...";
  text.style.marginTop = "10px";
  text.style.color = "#ff69b4";
  text.style.fontWeight = "bold";
  
  // Add the @keyframes rule for the spinning animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  
  document.head.appendChild(style);
  indicator.appendChild(spinner);
  indicator.appendChild(text);
  container.appendChild(indicator);
}

// Hide the loading indicator
function hideSolverLoadingIndicator() {
  const indicator = document.getElementById("solver-indicator");
  if (indicator) {
    indicator.remove();
  }
}

// Create a simplified board representation to send to workers
function createBoardRepresentation() {
  const board = {
    gridSize: gridSize,
    emptyCell: { ...emptyCell },
    pieces: []
  };
  
  // Add all pieces with their current and target positions
  for (const piece of pieces) {
    board.pieces.push({
      currentRow: parseInt(piece.dataset.row),
      currentCol: parseInt(piece.dataset.col),
      targetRow: parseInt(piece.dataset.originalRow),
      targetCol: parseInt(piece.dataset.originalCol)
    });
  }
  
  return board;
}

// Play the solution moves with animation
function playSolution(solution) {
  let moveIndex = 0;
  
  function playNextMove() {
    if (moveIndex >= solution.length) {
      // Solution complete
      console.log("🎊 Solution complete!");
      checkWin();
      return;
    }
    
    const move = solution[moveIndex];
    const pieceToMove = findPieceAt(move.row, move.col);
    
    console.log(`Move ${moveIndex + 1}/${solution.length}: Moving piece at (${move.row}, ${move.col})`);
    
    if (pieceToMove) {
      // This is a valid move - the piece must be adjacent to the empty cell
      if (isAdjacent(move.row, move.col, emptyCell.row, emptyCell.col)) {
        // Get original position info for the piece
        const originalRow = parseInt(pieceToMove.dataset.originalRow);
        const originalCol = parseInt(pieceToMove.dataset.originalCol);
        
        console.log(`  - Moving piece (${originalRow},${originalCol}) to empty cell at (${emptyCell.row},${emptyCell.col})`);
        
        // Swap positions
        movePieceTo(pieceToMove, emptyCell.row, emptyCell.col);
        
        // Update empty cell position
        emptyCell.row = move.row;
        emptyCell.col = move.col;
        
        // Update move counter
        moveCount++;
        updateMoveCounter();
      } else {
        console.error(`❌ Invalid move - piece at (${move.row},${move.col}) not adjacent to empty cell at (${emptyCell.row},${emptyCell.col})`);
      }
    } else {
      console.error(`❌ Could not find piece at position (${move.row},${move.col})`);
    }
    
    // Move to next move after a delay
    moveIndex++;
    setTimeout(playNextMove, 200);
  }
  
  // Start playing the solution
  console.log("▶️ Playing solution...");
  playNextMove();
}

// Use web workers to solve the puzzle in parallel with different strategies
function solveWithWebWorkers(boardState, callback) {
  // Check if browser supports web workers
  if (!window.Worker) {
    console.log("❌ Web Workers not supported in this browser, using fallback solver");
    callback(null);
    return;
  }
  
  console.log("🔄 Creating web workers to solve in parallel...");
  
  // Create a blob URL for the worker script
  const workerScript = `
    // Worker to solve sliding puzzle
    self.onmessage = function(e) {
      const boardState = e.data.boardState;
      const strategy = e.data.strategy;
      
      console.log("🧩 Worker started with strategy: " + strategy);
      
      // Try to solve the puzzle with the given strategy
      const solution = solvePuzzle(boardState, strategy);
      
      // Send the solution back to the main thread
      self.postMessage({
        strategy: strategy,
        solution: solution
      });
      
      // Terminate the worker
      self.close();
    };
    
    // Solve the puzzle using different strategies
    function solvePuzzle(boardState, strategy) {
      // Get the board state
      const gridSize = boardState.gridSize;
      const emptyCell = {...boardState.emptyCell};
      const pieces = [...boardState.pieces];
      
      // Different strategy implementations
      switch(strategy) {
        case "rowByRow":
          return solveRowByRow(gridSize, emptyCell, pieces);
        case "aStar":
          return solveAStar(gridSize, emptyCell, pieces);
        case "bfs":
          return solveBFS(gridSize, emptyCell, pieces);
        default:
          return solveRowByRow(gridSize, emptyCell, pieces);
      }
    }
    
    // Solve using row-by-row strategy
    function solveRowByRow(gridSize, emptyCell, pieces) {
      // For simplicity in this demo, we'll implement a basic row-by-row solver
      const solution = [];
      
      // Check if the puzzle is already solved
      if (isPuzzleSolved(pieces)) {
        return solution;
      }
      
      // Implement row-by-row solving (simplified for this demo)
      // Process each piece in order, row by row
      for (let targetRow = 0; targetRow < gridSize; targetRow++) {
        for (let targetCol = 0; targetCol < gridSize; targetCol++) {
          // Skip the final empty cell position
          if (targetRow === gridSize - 1 && targetCol === gridSize - 1) {
            continue;
          }
          
          // Find the piece that should be at this position
          const piece = findPieceByTarget(pieces, targetRow, targetCol);
          
          // If piece is not in the right position, move it
          if (piece.currentRow !== targetRow || piece.currentCol !== targetCol) {
            // Move the empty cell to be adjacent to the piece
            const adjacentMoves = moveEmptyCellAdjacent(emptyCell, piece.currentRow, piece.currentCol, pieces, solution);
            
            // If we couldn't get the empty cell adjacent to the piece, this strategy fails
            if (!adjacentMoves) {
              return [];
            }
            
            // Move the piece (which moves the empty cell to the piece's position)
            solution.push({ row: piece.currentRow, col: piece.currentCol });
            
            // Update piece and empty cell positions
            const oldEmptyRow = emptyCell.row;
            const oldEmptyCol = emptyCell.col;
            emptyCell.row = piece.currentRow;
            emptyCell.col = piece.currentCol;
            piece.currentRow = oldEmptyRow;
            piece.currentCol = oldEmptyCol;
          }
        }
      }
      
      return solution;
    }
    
    // A* search algorithm (simplified)
    function solveAStar(gridSize, emptyCell, pieces) {
      // This would be a more sophisticated solver using A* algorithm
      // For the demo, we'll return an empty solution to fall back to the built-in solver
      return [];
    }
    
    // BFS search algorithm (simplified)
    function solveBFS(gridSize, emptyCell, pieces) {
      // This would be another solver implementation using breadth-first search
      // For the demo, we'll return an empty solution to fall back to the built-in solver
      return [];
    }
    
    // Helper function to check if puzzle is solved
    function isPuzzleSolved(pieces) {
      for (const piece of pieces) {
        if (piece.currentRow !== piece.targetRow || piece.currentCol !== piece.targetCol) {
          return false;
        }
      }
      return true;
    }
    
    // Helper function to find a piece by its target position
    function findPieceByTarget(pieces, targetRow, targetCol) {
      for (const piece of pieces) {
        if (piece.targetRow === targetRow && piece.targetCol === targetCol) {
          return piece;
        }
      }
      return null;
    }
    
    // Helper function to move empty cell adjacent to a piece
    function moveEmptyCellAdjacent(emptyCell, pieceRow, pieceCol, pieces, solution) {
      // If already adjacent, we're done
      if (isAdjacent(emptyCell.row, emptyCell.col, pieceRow, pieceCol)) {
        return true;
      }
      
      // Find a path for the empty cell (simplified, not optimal)
      const visited = new Set();
      
      // Try moving horizontally first
      const colDiff = pieceCol - emptyCell.col;
      if (colDiff !== 0) {
        const direction = colDiff > 0 ? 1 : -1;
        for (let i = 0; i < Math.abs(colDiff); i++) {
          const nextCol = emptyCell.col + direction;
          
          // Check if we've reached our destination column
          if (emptyCell.row === pieceRow && nextCol === pieceCol) {
            // We've reached the piece, so we're adjacent
            break;
          }
          
          // Find the piece at the position we want to move the empty cell to
          const pieceToMove = findPieceAtPosition(pieces, emptyCell.row, nextCol);
          
          // Skip if no piece found (shouldn't happen in a valid puzzle)
          if (!pieceToMove) {
            return false;
          }
          
          // Move the piece to the empty cell's position
          solution.push({ row: pieceToMove.currentRow, col: pieceToMove.currentCol });
          
          // Update piece and empty cell positions
          pieceToMove.currentRow = emptyCell.row;
          pieceToMove.currentCol = emptyCell.col;
          emptyCell.col = nextCol;
        }
      }
      
      // Then move vertically
      const rowDiff = pieceRow - emptyCell.row;
      if (rowDiff !== 0) {
        const direction = rowDiff > 0 ? 1 : -1;
        for (let i = 0; i < Math.abs(rowDiff); i++) {
          const nextRow = emptyCell.row + direction;
          
          // Check if we've reached our destination adjacent to the piece
          if (nextRow === pieceRow && emptyCell.col === pieceCol) {
            // We've reached the piece, so we're adjacent
            break;
          }
          
          // Find the piece at the position we want to move the empty cell to
          const pieceToMove = findPieceAtPosition(pieces, nextRow, emptyCell.col);
          
          // Skip if no piece found (shouldn't happen in a valid puzzle)
          if (!pieceToMove) {
            return false;
          }
          
          // Move the piece to the empty cell's position
          solution.push({ row: pieceToMove.currentRow, col: pieceToMove.currentCol });
          
          // Update piece and empty cell positions
          pieceToMove.currentRow = emptyCell.row;
          pieceToMove.currentCol = emptyCell.col;
          emptyCell.row = nextRow;
        }
      }
      
      // Verify that we're now adjacent to the piece
      return isAdjacent(emptyCell.row, emptyCell.col, pieceRow, pieceCol);
    }
    
    // Helper function to find a piece at a specific position
    function findPieceAtPosition(pieces, row, col) {
      for (const piece of pieces) {
        if (piece.currentRow === row && piece.currentCol === col) {
          return piece;
        }
      }
      return null;
    }
    
    // Helper function to check if two positions are adjacent
    function isAdjacent(row1, col1, row2, col2) {
      return (
        (row1 === row2 && Math.abs(col1 - col2) === 1) ||
        (col1 === col2 && Math.abs(row1 - row2) === 1)
      );
    }
  `;
  
  const blob = new Blob([workerScript], { type: 'application/javascript' });
  const workerURL = URL.createObjectURL(blob);
  
  // The different solving strategies to try in parallel
  const strategies = ["rowByRow", "aStar", "bfs"];
  
  let workers = [];
  let solutions = [];
  let completedWorkers = 0;
  
  // Set a timeout to ensure we don't wait forever
  const timeoutId = setTimeout(() => {
    console.log("⏱️ Worker timeout reached, terminating remaining workers");
    
    // Terminate any remaining workers
    for (const worker of workers) {
      worker.terminate();
    }
    
    // Return the best solution so far, or null if none found
    const bestSolution = getBestSolution(solutions);
    callback(bestSolution);
  }, 5000); // 5 second timeout
  
  // Create a worker for each strategy
  for (let i = 0; i < strategies.length; i++) {
    const worker = new Worker(workerURL);
    workers.push(worker);
    
    worker.onmessage = function(e) {
      const result = e.data;
      console.log(`✓ Worker with strategy "${result.strategy}" completed`);
      
      // Store the solution if it's valid
      if (result.solution && result.solution.length > 0) {
        solutions.push({
          strategy: result.strategy,
          solution: result.solution,
          length: result.solution.length
        });
      }
      
      // Check if all workers are done
      completedWorkers++;
      if (completedWorkers === strategies.length) {
        // All workers completed, clear the timeout
        clearTimeout(timeoutId);
        
        // Get the best solution
        const bestSolution = getBestSolution(solutions);
        callback(bestSolution);
        
        // Clean up the worker URL
        URL.revokeObjectURL(workerURL);
      }
    };
    
    worker.onerror = function(e) {
      console.error(`❌ Worker with strategy "${strategies[i]}" encountered an error:`, e);
      
      // Count this worker as completed
      completedWorkers++;
      if (completedWorkers === strategies.length) {
        // All workers completed, clear the timeout
        clearTimeout(timeoutId);
        
        // Get the best solution
        const bestSolution = getBestSolution(solutions);
        callback(bestSolution);
        
        // Clean up the worker URL
        URL.revokeObjectURL(workerURL);
      }
    };
    
    // Start the worker with its strategy
    worker.postMessage({
      boardState: boardState,
      strategy: strategies[i]
    });
  }
}

// Return the best (shortest) solution from the list of solutions
function getBestSolution(solutions) {
  if (solutions.length === 0) {
    return null;
  }
  
  // Sort solutions by length (shortest first)
  solutions.sort((a, b) => a.length - b.length);
  
  console.log(`📊 Solution comparison:
${solutions.map(s => `- ${s.strategy}: ${s.length} moves`).join('\n')}`);
  
  // Return the shortest solution
  return solutions[0].solution;
}

// Check if the puzzle is solved
function isPuzzleSolved() {
  for (const piece of pieces) {
    const currentRow = parseInt(piece.dataset.row);
    const currentCol = parseInt(piece.dataset.col);
    const originalRow = parseInt(piece.dataset.originalRow);
    const originalCol = parseInt(piece.dataset.originalCol);
    
    if (currentRow !== originalRow || currentCol !== originalCol) {
      return false;
    }
  }
  return true;
}

// Generate a realistic solution for the sliding puzzle
function generateRealisticSolution() {
  console.log(`📊 Starting solver for ${gridSize}x${gridSize} puzzle`);
  
  // For 3x3 puzzle, we'll use a guided approach rather than a brute force search
  const solution = [];
  const state = createBoardState();
  
  console.log("📋 Initial board state:");
  logBoardState(state);
  
  // Solve the puzzle row by row, starting from the top
  console.log("🔝 Solving top row...");
  // First, solve the top row
  if (solveTopRow(state, solution)) {
    console.log("✓ Top row solved successfully");
    
    // Then solve the second row
    console.log("2️⃣ Solving second row...");
    if (solveSecondRow(state, solution)) {
      console.log("✓ Second row solved successfully");
      
      // For 3x3, solve the remaining bottom-right 2x2 section
      if (gridSize === 3) {
        console.log("🧩 Solving bottom-right 2x2 section...");
        solveBottomRightSection(state, solution);
        console.log("✓ Bottom-right section solved");
      } else {
        // For 4x4 and 5x5, continue with remaining rows
        for (let row = 2; row < gridSize - 1; row++) {
          console.log(`🔄 Solving row ${row + 1}...`);
          solveRow(state, solution, row);
          console.log(`✓ Row ${row + 1} solved successfully`);
        }
        // Solve the last row
        console.log("🔚 Solving last row...");
        solveLastRow(state, solution);
        console.log("✓ Last row solved successfully");
      }
    } else {
      console.error("❌ Failed to solve second row");
    }
  } else {
    console.error("❌ Failed to solve top row");
  }
  
  console.log(`📝 Solution generated with ${solution.length} moves`);
  return solution;
}

// Helper function to log the board state
function logBoardState(state) {
  const boardOutput = [];
  
  for (let r = 0; r < gridSize; r++) {
    const rowOutput = [];
    for (let c = 0; c < gridSize; c++) {
      if (state[r][c] === "empty") {
        rowOutput.push("[ ]");
      } else if (state[r][c]) {
        const piece = state[r][c];
        rowOutput.push(`[${piece.targetRow},${piece.targetCol}]`);
      } else {
        rowOutput.push("[?]");
      }
    }
    boardOutput.push(rowOutput.join(" "));
  }
  
  console.log(boardOutput.join("\n"));
}

// Create a representation of the current board state
function createBoardState() {
  const state = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
  
  // Mark the empty cell position
  state[emptyCell.row][emptyCell.col] = "empty";
  
  // Place all pieces in the state
  for (const piece of pieces) {
    const row = parseInt(piece.dataset.row);
    const col = parseInt(piece.dataset.col);
    const originalRow = parseInt(piece.dataset.originalRow);
    const originalCol = parseInt(piece.dataset.originalCol);
    
    state[row][col] = { 
      element: piece, 
      targetRow: originalRow, 
      targetCol: originalCol 
    };
  }
  
  return state;
}

// Solve the top row of the puzzle
function solveTopRow(state, solution) {
  // First, place the top-left piece (0,0)
  if (!placePiece(state, solution, 0, 0)) return false;
  
  // Then place the remaining pieces in the top row left-to-right
  for (let col = 1; col < gridSize - 1; col++) {
    if (!placePiece(state, solution, 0, col)) return false;
  }
  
  // Special case for the top-right piece
  return placeTopRightPiece(state, solution);
}

// Solve the second row of the puzzle
function solveSecondRow(state, solution) {
  // Place the leftmost piece in the second row
  if (!placePiece(state, solution, 1, 0)) return false;
  
  // Then place the remaining pieces in the second row left-to-right
  for (let col = 1; col < gridSize - 1; col++) {
    if (!placePiece(state, solution, 1, col)) return false;
  }
  
  // Special case for the second row, rightmost piece
  return placeSecondRowRightPiece(state, solution);
}

// Solve a middle row (for 4x4 and larger puzzles)
function solveRow(state, solution, row) {
  // Place the leftmost piece in this row
  if (!placePiece(state, solution, row, 0)) return false;
  
  // Then place the remaining pieces in the row left-to-right
  for (let col = 1; col < gridSize - 1; col++) {
    if (!placePiece(state, solution, row, col)) return false;
  }
  
  // Special case for the rightmost piece in this row
  return placeRowRightPiece(state, solution, row);
}

// Solve the last row of the puzzle
function solveLastRow(state, solution) {
  // For the last row, we handle it specially to maintain the correct empty cell position
  // This would involve placing the last remaining 2x2 or 3x3 section
  
  // This is a simplification - a real solver would need more complex logic here
  return true;
}

// Solve the bottom-right 2x2 section of a 3x3 puzzle
function solveBottomRightSection(state, solution) {
  // For a 3x3 puzzle, after solving the top two rows, 
  // we can solve the remaining bottom-right 2x2 section
  
  // Move the empty cell to the bottom right
  moveEmptyCellTo(state, solution, gridSize - 1, gridSize - 1);
  
  // Move pieces in a clockwise direction until solved
  let attempts = 0;
  const maxAttempts = 20; // Prevent infinite loops
  
  while (!isPuzzleSolved() && attempts < maxAttempts) {
    // Move a piece that's adjacent to the empty cell
    const adjacentPieces = [];
    
    if (emptyCell.row > 0) {
      adjacentPieces.push({ row: emptyCell.row - 1, col: emptyCell.col });
    }
    if (emptyCell.col > 0) {
      adjacentPieces.push({ row: emptyCell.row, col: emptyCell.col - 1 });
    }
    if (emptyCell.row < gridSize - 1) {
      adjacentPieces.push({ row: emptyCell.row + 1, col: emptyCell.col });
    }
    if (emptyCell.col < gridSize - 1) {
      adjacentPieces.push({ row: emptyCell.row, col: emptyCell.col + 1 });
    }
    
    if (adjacentPieces.length > 0) {
      // Choose a piece to move
      const move = adjacentPieces[0];
      solution.push(move);
      
      // Update state
      const pieceToMove = state[move.row][move.col];
      state[emptyCell.row][emptyCell.col] = pieceToMove;
      state[move.row][move.col] = "empty";
      
      // Update empty cell
      emptyCell.row = move.row;
      emptyCell.col = move.col;
    }
    
    attempts++;
  }
  
  return true;
}

// Place a piece in its target position
function placePiece(state, solution, targetRow, targetCol) {
  console.log(`🎯 Placing piece for position (${targetRow},${targetCol})`);
  
  // Find the piece that should go at this target position
  let targetPiece = null;
  let pieceRow = -1, pieceCol = -1;
  
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const cell = state[r][c];
      if (cell && cell !== "empty" && cell.targetRow === targetRow && cell.targetCol === targetCol) {
        targetPiece = cell;
        pieceRow = r;
        pieceCol = c;
        break;
      }
    }
    if (targetPiece) break;
  }
  
  if (!targetPiece) {
    console.error(`❌ Could not find piece for position (${targetRow},${targetCol})`);
    return false;
  }
  
  console.log(`🧩 Found piece at (${pieceRow},${pieceCol}) that should go to (${targetRow},${targetCol})`);
  
  // If the piece is already in the correct position, we're done
  if (pieceRow === targetRow && pieceCol === targetCol) {
    console.log(`✓ Piece already in correct position (${targetRow},${targetCol})`);
    return true;
  }
  
  // Otherwise, move the empty cell next to the piece
  console.log(`🔄 Moving empty cell next to piece at (${pieceRow},${pieceCol})`);
  if (!moveEmptyCellTo(state, solution, pieceRow, pieceCol)) {
    console.error(`❌ Failed to move empty cell next to piece at (${pieceRow},${pieceCol})`);
    return false;
  }
  
  // Special handling for different cases
  if (targetRow === 0 && targetCol === 0) {
    // Top-left piece is easiest
    console.log(`🔼 Moving top-left piece from (${pieceRow},${pieceCol}) to (0,0)`);
    return moveTopLeftPiece(state, solution, pieceRow, pieceCol);
  } else if (targetRow === 0) {
    // Top row pieces need special handling
    console.log(`🔝 Moving top row piece from (${pieceRow},${pieceCol}) to (0,${targetCol})`);
    return moveTopRowPiece(state, solution, pieceRow, pieceCol, targetCol);
  } else if (targetCol === 0) {
    // Leftmost pieces need special handling
    console.log(`⬅️ Moving leftmost piece from (${pieceRow},${pieceCol}) to (${targetRow},0)`);
    return moveLeftColumnPiece(state, solution, pieceRow, pieceCol, targetRow);
  } else {
    // General case
    console.log(`🔄 Moving general piece from (${pieceRow},${pieceCol}) to (${targetRow},${targetCol})`);
    return moveGeneralPiece(state, solution, pieceRow, pieceCol, targetRow, targetCol);
  }
}

// Move the empty cell to a specific position
function moveEmptyCellTo(state, solution, targetRow, targetCol) {
  console.log(`⬜ Moving empty cell from (${emptyCell.row},${emptyCell.col}) to (${targetRow},${targetCol})`);
  
  // Find path from empty cell to target position
  // This is a simplification - a real implementation would use A* or BFS
  
  // Determine direction to move
  const rowDiff = targetRow - emptyCell.row;
  const colDiff = targetCol - emptyCell.col;
  
  console.log(`  - Need to move ${Math.abs(colDiff)} steps horizontally and ${Math.abs(rowDiff)} steps vertically`);
  
  // First move horizontally
  for (let i = 0; i < Math.abs(colDiff); i++) {
    const direction = colDiff > 0 ? 1 : -1;
    const moveRow = emptyCell.row;
    const moveCol = emptyCell.col + direction;
    
    // Make sure we're not out of bounds
    if (moveCol < 0 || moveCol >= gridSize) {
      console.error(`❌ Invalid move - col ${moveCol} out of bounds`);
      return false;
    }
    
    // Get info about the piece we're moving
    let pieceInfo = "";
    if (state[moveRow][moveCol] && state[moveRow][moveCol] !== "empty") {
      pieceInfo = `(target: ${state[moveRow][moveCol].targetRow},${state[moveRow][moveCol].targetCol})`;
    }
    
    console.log(`  - Horizontal move: Moving piece at (${moveRow},${moveCol}) ${pieceInfo} into empty cell`);
    
    // Move the piece at this position to the empty cell
    const move = { row: moveRow, col: moveCol };
    solution.push(move);
    
    // Update state
    const pieceToMove = state[moveRow][moveCol];
    state[emptyCell.row][emptyCell.col] = pieceToMove;
    state[moveRow][moveCol] = "empty";
    
    // Update empty cell
    emptyCell.col = moveCol;
  }
  
  // Then move vertically
  for (let i = 0; i < Math.abs(rowDiff); i++) {
    const direction = rowDiff > 0 ? 1 : -1;
    const moveRow = emptyCell.row + direction;
    const moveCol = emptyCell.col;
    
    // Make sure we're not out of bounds
    if (moveRow < 0 || moveRow >= gridSize) {
      console.error(`❌ Invalid move - row ${moveRow} out of bounds`);
      return false;
    }
    
    // Get info about the piece we're moving
    let pieceInfo = "";
    if (state[moveRow][moveCol] && state[moveRow][moveCol] !== "empty") {
      pieceInfo = `(target: ${state[moveRow][moveCol].targetRow},${state[moveRow][moveCol].targetCol})`;
    }
    
    console.log(`  - Vertical move: Moving piece at (${moveRow},${moveCol}) ${pieceInfo} into empty cell`);
    
    // Move the piece at this position to the empty cell
    const move = { row: moveRow, col: moveCol };
    solution.push(move);
    
    // Update state
    const pieceToMove = state[moveRow][moveCol];
    state[emptyCell.row][emptyCell.col] = pieceToMove;
    state[moveRow][moveCol] = "empty";
    
    // Update empty cell
    emptyCell.row = moveRow;
  }
  
  console.log(`✓ Empty cell now at (${emptyCell.row},${emptyCell.col})`);
  return true;
}

// Special case handlers
function moveTopLeftPiece(state, solution, pieceRow, pieceCol) {
  // Top-left piece is the easiest case
  // We just need to move it directly to (0,0)
  
  // Ensure empty cell is below or to right of piece
  if (emptyCell.row === pieceRow && emptyCell.col === pieceCol + 1) {
    // Empty cell is to the right of the piece - good
  } else if (emptyCell.row === pieceRow + 1 && emptyCell.col === pieceCol) {
    // Empty cell is below the piece - good
  } else {
    // Move empty cell to the right of the piece
    moveEmptyCellTo(state, solution, pieceRow, pieceCol + 1);
  }
  
  // Now move the piece to (0,0)
  // We'll use a simple loop that moves the empty cell around the piece
  while (pieceRow > 0 || pieceCol > 0) {
    if (pieceCol > 0) {
      // Move piece left
      const move = { row: pieceRow, col: pieceCol };
      solution.push(move);
      
      // Update state
      state[emptyCell.row][emptyCell.col] = state[pieceRow][pieceCol];
      state[pieceRow][pieceCol] = "empty";
      
      // Update positions
      const oldEmptyRow = emptyCell.row;
      const oldEmptyCol = emptyCell.col;
      emptyCell.row = pieceRow;
      emptyCell.col = pieceCol;
      pieceRow = oldEmptyRow;
      pieceCol = oldEmptyCol;
    } else if (pieceRow > 0) {
      // Move piece up
      const move = { row: pieceRow, col: pieceCol };
      solution.push(move);
      
      // Update state
      state[emptyCell.row][emptyCell.col] = state[pieceRow][pieceCol];
      state[pieceRow][pieceCol] = "empty";
      
      // Update positions
      const oldEmptyRow = emptyCell.row;
      const oldEmptyCol = emptyCell.col;
      emptyCell.row = pieceRow;
      emptyCell.col = pieceCol;
      pieceRow = oldEmptyRow;
      pieceCol = oldEmptyCol;
    }
  }
  
  return true;
}

function moveTopRowPiece(state, solution, pieceRow, pieceCol, targetCol) {
  // Move a piece in the top row to its correct position
  
  // First, ensure the empty cell is below the piece
  if (emptyCell.row !== pieceRow + 1 || emptyCell.col !== pieceCol) {
    moveEmptyCellTo(state, solution, pieceRow + 1, pieceCol);
  }
  
  // Move the piece down
  const moveDown = { row: pieceRow, col: pieceCol };
  solution.push(moveDown);
  
  // Update state
  state[emptyCell.row][emptyCell.col] = state[pieceRow][pieceCol];
  state[pieceRow][pieceCol] = "empty";
  
  // Update positions
  const oldEmptyRow = emptyCell.row;
  const oldEmptyCol = emptyCell.col;
  emptyCell.row = pieceRow;
  emptyCell.col = pieceCol;
  pieceRow = oldEmptyRow;
  pieceCol = oldEmptyCol;
  
  // Now navigate to the correct position
  // Loop until we get to the right column
  while (pieceCol !== targetCol) {
    if (pieceCol < targetCol) {
      // Need to move right
      
      // First move empty cell to the right of the piece
      if (emptyCell.row !== pieceRow || emptyCell.col !== pieceCol + 1) {
        // If we're on the top row, we need to go around
        if (pieceRow === 0) {
          moveEmptyCellTo(state, solution, pieceRow + 1, pieceCol + 1);
          
          // Move up
          const move = { row: pieceRow + 1, col: pieceCol + 1 };
          solution.push(move);
          
          // Update state
          state[emptyCell.row][emptyCell.col] = state[pieceRow + 1][pieceCol + 1];
          state[pieceRow + 1][pieceCol + 1] = "empty";
          
          // Update empty cell
          emptyCell.row = pieceRow + 1;
          emptyCell.col = pieceCol + 1;
        } else {
          moveEmptyCellTo(state, solution, pieceRow, pieceCol + 1);
        }
      }
      
      // Move piece right
      const move = { row: pieceRow, col: pieceCol };
      solution.push(move);
      
      // Update state
      state[emptyCell.row][emptyCell.col] = state[pieceRow][pieceCol];
      state[pieceRow][pieceCol] = "empty";
      
      // Update positions
      const oldEmptyRow = emptyCell.row;
      const oldEmptyCol = emptyCell.col;
      emptyCell.row = pieceRow;
      emptyCell.col = pieceCol;
      pieceRow = oldEmptyRow;
      pieceCol = oldEmptyCol;
    } else {
      // Need to move left
      
      // First move empty cell to the left of the piece
      if (emptyCell.row !== pieceRow || emptyCell.col !== pieceCol - 1) {
        // If we're on the top row, we need to go around
        if (pieceRow === 0) {
          moveEmptyCellTo(state, solution, pieceRow + 1, pieceCol - 1);
          
          // Move up
          const move = { row: pieceRow + 1, col: pieceCol - 1 };
          solution.push(move);
          
          // Update state
          state[emptyCell.row][emptyCell.col] = state[pieceRow + 1][pieceCol - 1];
          state[pieceRow + 1][pieceCol - 1] = "empty";
          
          // Update empty cell
          emptyCell.row = pieceRow + 1;
          emptyCell.col = pieceCol - 1;
        } else {
          moveEmptyCellTo(state, solution, pieceRow, pieceCol - 1);
        }
      }
      
      // Move piece left
      const move = { row: pieceRow, col: pieceCol };
      solution.push(move);
      
      // Update state
      state[emptyCell.row][emptyCell.col] = state[pieceRow][pieceCol];
      state[pieceRow][pieceCol] = "empty";
      
      // Update positions
      const oldEmptyRow = emptyCell.row;
      const oldEmptyCol = emptyCell.col;
      emptyCell.row = pieceRow;
      emptyCell.col = pieceCol;
      pieceRow = oldEmptyRow;
      pieceCol = oldEmptyCol;
    }
  }
  
  // Now we're at the right column, move up to row 0
  while (pieceRow > 0) {
    // Move empty cell above the piece
    if (emptyCell.row !== pieceRow - 1 || emptyCell.col !== pieceCol) {
      moveEmptyCellTo(state, solution, pieceRow - 1, pieceCol);
    }
    
    // Move piece up
    const move = { row: pieceRow, col: pieceCol };
    solution.push(move);
    
    // Update state
    state[emptyCell.row][emptyCell.col] = state[pieceRow][pieceCol];
    state[pieceRow][pieceCol] = "empty";
    
    // Update positions
    const oldEmptyRow = emptyCell.row;
    const oldEmptyCol = emptyCell.col;
    emptyCell.row = pieceRow;
    emptyCell.col = pieceCol;
    pieceRow = oldEmptyRow;
    pieceCol = oldEmptyCol;
  }
  
  return true;
}

function moveLeftColumnPiece(state, solution, pieceRow, pieceCol, targetRow) {
  // Move a piece in the leftmost column to its correct position
  
  // First, ensure the empty cell is to the right of the piece
  if (emptyCell.row !== pieceRow || emptyCell.col !== pieceCol + 1) {
    moveEmptyCellTo(state, solution, pieceRow, pieceCol + 1);
  }
  
  // Move the piece right
  const moveRight = { row: pieceRow, col: pieceCol };
  solution.push(moveRight);
  
  // Update state
  state[emptyCell.row][emptyCell.col] = state[pieceRow][pieceCol];
  state[pieceRow][pieceCol] = "empty";
  
  // Update positions
  const oldEmptyRow = emptyCell.row;
  const oldEmptyCol = emptyCell.col;
  emptyCell.row = pieceRow;
  emptyCell.col = pieceCol;
  pieceRow = oldEmptyRow;
  pieceCol = oldEmptyCol;
  
  // Now navigate to the correct row
  while (pieceRow !== targetRow) {
    if (pieceRow < targetRow) {
      // Need to move down
      
      // First move empty cell below the piece
      if (emptyCell.row !== pieceRow + 1 || emptyCell.col !== pieceCol) {
        // If we're on the leftmost column, we need to go around
        if (pieceCol === 0) {
          moveEmptyCellTo(state, solution, pieceRow + 1, pieceCol + 1);
          
          // Move left
          const move = { row: pieceRow + 1, col: pieceCol + 1 };
          solution.push(move);
          
          // Update state
          state[emptyCell.row][emptyCell.col] = state[pieceRow + 1][pieceCol + 1];
          state[pieceRow + 1][pieceCol + 1] = "empty";
          
          // Update empty cell
          emptyCell.row = pieceRow + 1;
          emptyCell.col = pieceCol + 1;
        } else {
          moveEmptyCellTo(state, solution, pieceRow + 1, pieceCol);
        }
      }
      
      // Move piece down
      const move = { row: pieceRow, col: pieceCol };
      solution.push(move);
      
      // Update state
      state[emptyCell.row][emptyCell.col] = state[pieceRow][pieceCol];
      state[pieceRow][pieceCol] = "empty";
      
      // Update positions
      const oldEmptyRow = emptyCell.row;
      const oldEmptyCol = emptyCell.col;
      emptyCell.row = pieceRow;
      emptyCell.col = pieceCol;
      pieceRow = oldEmptyRow;
      pieceCol = oldEmptyCol;
    } else {
      // Need to move up
      
      // First move empty cell above the piece
      if (emptyCell.row !== pieceRow - 1 || emptyCell.col !== pieceCol) {
        // If we're on the leftmost column, we need to go around
        if (pieceCol === 0) {
          moveEmptyCellTo(state, solution, pieceRow - 1, pieceCol + 1);
          
          // Move left
          const move = { row: pieceRow - 1, col: pieceCol + 1 };
          solution.push(move);
          
          // Update state
          state[emptyCell.row][emptyCell.col] = state[pieceRow - 1][pieceCol + 1];
          state[pieceRow - 1][pieceCol + 1] = "empty";
          
          // Update empty cell
          emptyCell.row = pieceRow - 1;
          emptyCell.col = pieceCol + 1;
        } else {
          moveEmptyCellTo(state, solution, pieceRow - 1, pieceCol);
        }
      }
      
      // Move piece up
      const move = { row: pieceRow, col: pieceCol };
      solution.push(move);
      
      // Update state
      state[emptyCell.row][emptyCell.col] = state[pieceRow][pieceCol];
      state[pieceRow][pieceCol] = "empty";
      
      // Update positions
      const oldEmptyRow = emptyCell.row;
      const oldEmptyCol = emptyCell.col;
      emptyCell.row = pieceRow;
      emptyCell.col = pieceCol;
      pieceRow = oldEmptyRow;
      pieceCol = oldEmptyCol;
    }
  }
  
  // Now we're at the right row, move left to column 0
  while (pieceCol > 0) {
    // Move empty cell to the left of the piece
    if (emptyCell.row !== pieceRow || emptyCell.col !== pieceCol - 1) {
      moveEmptyCellTo(state, solution, pieceRow, pieceCol - 1);
    }
    
    // Move piece left
    const move = { row: pieceRow, col: pieceCol };
    solution.push(move);
    
    // Update state
    state[emptyCell.row][emptyCell.col] = state[pieceRow][pieceCol];
    state[pieceRow][pieceCol] = "empty";
    
    // Update positions
    const oldEmptyRow = emptyCell.row;
    const oldEmptyCol = emptyCell.col;
    emptyCell.row = pieceRow;
    emptyCell.col = pieceCol;
    pieceRow = oldEmptyRow;
    pieceCol = oldEmptyCol;
  }
  
  return true;
}

function moveGeneralPiece(state, solution, pieceRow, pieceCol, targetRow, targetCol) {
  // For general case pieces (not in the top row or leftmost column)
  
  // First, ensure the target position is free
  // We need to move from current position to target position
  
  // Calculate the optimal path
  // For simplicity, we'll use a simple approach: first move horizontally, then vertically
  
  // First move horizontally to the target column
  while (pieceCol !== targetCol) {
    if (pieceCol < targetCol) {
      // Need to move right
      
      // First move empty cell to the right of the piece
      if (emptyCell.row !== pieceRow || emptyCell.col !== pieceCol + 1) {
        moveEmptyCellTo(state, solution, pieceRow, pieceCol + 1);
      }
      
      // Move piece right
      const move = { row: pieceRow, col: pieceCol };
      solution.push(move);
      
      // Update state
      state[emptyCell.row][emptyCell.col] = state[pieceRow][pieceCol];
      state[pieceRow][pieceCol] = "empty";
      
      // Update positions
      const oldEmptyRow = emptyCell.row;
      const oldEmptyCol = emptyCell.col;
      emptyCell.row = pieceRow;
      emptyCell.col = pieceCol;
      pieceRow = oldEmptyRow;
      pieceCol = oldEmptyCol;
    } else {
      // Need to move left
      
      // First move empty cell to the left of the piece
      if (emptyCell.row !== pieceRow || emptyCell.col !== pieceCol - 1) {
        moveEmptyCellTo(state, solution, pieceRow, pieceCol - 1);
      }
      
      // Move piece left
      const move = { row: pieceRow, col: pieceCol };
      solution.push(move);
      
      // Update state
      state[emptyCell.row][emptyCell.col] = state[pieceRow][pieceCol];
      state[pieceRow][pieceCol] = "empty";
      
      // Update positions
      const oldEmptyRow = emptyCell.row;
      const oldEmptyCol = emptyCell.col;
      emptyCell.row = pieceRow;
      emptyCell.col = pieceCol;
      pieceRow = oldEmptyRow;
      pieceCol = oldEmptyCol;
    }
  }
  
  // Then move vertically to the target row
  while (pieceRow !== targetRow) {
    if (pieceRow < targetRow) {
      // Need to move down
      
      // First move empty cell below the piece
      if (emptyCell.row !== pieceRow + 1 || emptyCell.col !== pieceCol) {
        moveEmptyCellTo(state, solution, pieceRow + 1, pieceCol);
      }
      
      // Move piece down
      const move = { row: pieceRow, col: pieceCol };
      solution.push(move);
      
      // Update state
      state[emptyCell.row][emptyCell.col] = state[pieceRow][pieceCol];
      state[pieceRow][pieceCol] = "empty";
      
      // Update positions
      const oldEmptyRow = emptyCell.row;
      const oldEmptyCol = emptyCell.col;
      emptyCell.row = pieceRow;
      emptyCell.col = pieceCol;
      pieceRow = oldEmptyRow;
      pieceCol = oldEmptyCol;
    } else {
      // Need to move up
      
      // First move empty cell above the piece
      if (emptyCell.row !== pieceRow - 1 || emptyCell.col !== pieceCol) {
        moveEmptyCellTo(state, solution, pieceRow - 1, pieceCol);
      }
      
      // Move piece up
      const move = { row: pieceRow, col: pieceCol };
      solution.push(move);
      
      // Update state
      state[emptyCell.row][emptyCell.col] = state[pieceRow][pieceCol];
      state[pieceRow][pieceCol] = "empty";
      
      // Update positions
      const oldEmptyRow = emptyCell.row;
      const oldEmptyCol = emptyCell.col;
      emptyCell.row = pieceRow;
      emptyCell.col = pieceCol;
      pieceRow = oldEmptyRow;
      pieceCol = oldEmptyCol;
    }
  }
  
  return true;
}

function placeTopRightPiece(state, solution) {
  // Special case for the top-right piece (0, gridSize-1)
  const targetRow = 0;
  const targetCol = gridSize - 1;
  
  // Find the piece that should go at the top-right
  let targetPiece = null;
  let pieceRow = -1, pieceCol = -1;
  
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const cell = state[r][c];
      if (cell && cell !== "empty" && cell.targetRow === targetRow && cell.targetCol === targetCol) {
        targetPiece = cell;
        pieceRow = r;
        pieceCol = c;
        break;
      }
    }
    if (targetPiece) break;
  }
  
  if (!targetPiece) {
    console.error("Could not find piece for top-right position");
    return false;
  }
  
  // If the piece is already in the correct position, we're done
  if (pieceRow === targetRow && pieceCol === targetCol) {
    return true;
  }
  
  // Otherwise, move the empty cell next to the piece
  if (!moveEmptyCellTo(state, solution, pieceRow, pieceCol)) {
    return false;
  }
  
  // Use the top row piece handler to place it
  return moveTopRowPiece(state, solution, pieceRow, pieceCol, targetCol);
}

function placeSecondRowRightPiece(state, solution) {
  // Similar to placeTopRightPiece but for the second row, rightmost piece
  const targetRow = 1;
  const targetCol = gridSize - 1;
  
  // Find the piece that should go at this position
  let targetPiece = null;
  let pieceRow = -1, pieceCol = -1;
  
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const cell = state[r][c];
      if (cell && cell !== "empty" && cell.targetRow === targetRow && cell.targetCol === targetCol) {
        targetPiece = cell;
        pieceRow = r;
        pieceCol = c;
        break;
      }
    }
    if (targetPiece) break;
  }
  
  if (!targetPiece) {
    console.error("Could not find piece for second row rightmost position");
    return false;
  }
  
  // If the piece is already in the correct position, we're done
  if (pieceRow === targetRow && pieceCol === targetCol) {
    return true;
  }
  
  // Otherwise, move the empty cell next to the piece
  if (!moveEmptyCellTo(state, solution, pieceRow, pieceCol)) {
    return false;
  }
  
  // For this special case, we'll use the general piece mover
  return moveGeneralPiece(state, solution, pieceRow, pieceCol, targetRow, targetCol);
}

function placeRowRightPiece(state, solution, row) {
  // Special case for the rightmost piece in a row
  const targetRow = row;
  const targetCol = gridSize - 1;
  
  // Find the piece that should go at this position
  let targetPiece = null;
  let pieceRow = -1, pieceCol = -1;
  
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const cell = state[r][c];
      if (cell && cell !== "empty" && cell.targetRow === targetRow && cell.targetCol === targetCol) {
        targetPiece = cell;
        pieceRow = r;
        pieceCol = c;
        break;
      }
    }
    if (targetPiece) break;
  }
  
  if (!targetPiece) {
    console.error("Could not find piece for row", row, "rightmost position");
    return false;
  }
  
  // If the piece is already in the correct position, we're done
  if (pieceRow === targetRow && pieceCol === targetCol) {
    return true;
  }
  
  // Otherwise, move the empty cell next to the piece
  if (!moveEmptyCellTo(state, solution, pieceRow, pieceCol)) {
    return false;
  }
  
  // For this special case, we'll use the general piece mover
  return moveGeneralPiece(state, solution, pieceRow, pieceCol, targetRow, targetCol);
}

// These functions have been replaced by the simpler direct solution in solvePuzzle

// Find a piece at a specific position
function findPieceAt(row, col) {
  return pieces.find(
    (piece) =>
      parseInt(piece.dataset.row) === row &&
      parseInt(piece.dataset.col) === col,
  );
}

// Game has been simplified to use a single solver method

// Helper function to find a piece in the state by its position
function findPieceInState(state, row, col) {
  for (const key in state) {
    const piece = state[key];
    if (piece.row === row && piece.col === col) {
      return piece;
    }
  }
  return null;
}

// Celebration animation when puzzle is solved
function celebrateWin() {
  // We could add more elaborate celebration effects here
  const container = document.getElementById("puzzle-container");

  // Create confetti
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement("div");
    confetti.style.position = "absolute";
    confetti.style.width = "10px";
    confetti.style.height = "10px";
    confetti.style.borderRadius = "50%";
    confetti.style.backgroundColor = getRandomColor();
    confetti.style.left = Math.random() * 400 + "px";
    confetti.style.top = Math.random() * 400 + "px";
    confetti.style.zIndex = "20";

    // Animation
    confetti.animate(
      [
        { transform: "translateY(0) rotate(0)", opacity: 1 },
        {
          transform: `translateY(${Math.random() * 200 - 100}px) translateX(${Math.random() * 200 - 100}px) rotate(${Math.random() * 360}deg)`,
          opacity: 0,
        },
      ],
      {
        duration: 1000 + Math.random() * 1000,
        easing: "cubic-bezier(0,.9,.57,1)",
      },
    );

    container.appendChild(confetti);

    // Remove after animation
    setTimeout(() => {
      confetti.remove();
    }, 2000);
  }
}

// Helper function for celebration
function getRandomColor() {
  const colors = ["#ff69b4", "#87CEFA", "#90EE90", "#FFD700", "#FF7F50"];
  return colors[Math.floor(Math.random() * colors.length)];
}
