document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const statusDisplay = document.querySelector('.status');
    const resetButton = document.querySelector('.reset-btn');
    const powerupInfo = document.querySelector('.powerup-info');
    
    let gameActive = true;
    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let playerHasBomb = { X: false, O: false };
    
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        if (gameState[clickedCellIndex] !== '' || !gameActive) return;
        
        if (playerHasBomb[currentPlayer]) {
            // Use bomb to clear adjacent cells
            clearAdjacentCells(clickedCellIndex);
            playerHasBomb[currentPlayer] = false;
            clickedCell.classList.remove('bomb');
            powerupInfo.textContent = `Get 3 in a row to earn a bomb for your next move!`;
        } else {
            // Normal move
            gameState[clickedCellIndex] = currentPlayer;
            clickedCell.textContent = currentPlayer;
            clickedCell.classList.add(currentPlayer.toLowerCase());
        }
        
        checkResult();
    }
    
    function clearAdjacentCells(index) {
        const adjacentIndexes = getAdjacentIndexes(index);
        adjacentIndexes.forEach(i => {
            if (gameState[i] !== '') {
                gameState[i] = '';
                const cell = document.querySelector(`.cell[data-index="${i}"]`);
                cell.textContent = '';
                cell.classList.remove('x', 'o');
            }
        });
    }
    
    function getAdjacentIndexes(index) {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const adjacent = [];
        
        // Add all 8 possible adjacent cells
        for (let r = Math.max(0, row-1); r <= Math.min(2, row+1); r++) {
            for (let c = Math.max(0, col-1); c <= Math.min(2, col+1); c++) {
                if (r !== row || c !== col) {
                    adjacent.push(r * 3 + c);
                }
            }
        }
        
        return adjacent;
    }
    
    function checkResult() {
        let roundWon = false;
        
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (gameState[a] === '' || gameState[b] === '' || gameState[c] === '') continue;
            
            if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
                roundWon = true;
                playerHasBomb[gameState[a]] = true;
                break;
            }
        }
        
        if (roundWon) {
            statusDisplay.textContent = `Player ${currentPlayer} wins and gets a bomb!`;
            powerupInfo.textContent = `Player ${currentPlayer} can use bomb next turn!`;
            gameActive = false;
            return;
        }
        
        if (!gameState.includes('')) {
            statusDisplay.textContent = 'Game ended in a draw!';
            gameActive = false;
            return;
        }
        
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        const status = playerHasBomb[currentPlayer] 
            ? `Player ${currentPlayer}'s turn (Bomb ready!)`
            : `Player ${currentPlayer}'s turn`;
        statusDisplay.textContent = status;
    }
    
    function resetGame() {
        gameActive = true;
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        playerHasBomb = { X: false, O: false };
        statusDisplay.textContent = `Player ${currentPlayer}'s turn`;
        powerupInfo.textContent = `Get 3 in a row to earn a bomb for your next move!`;
        
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'bomb');
        });
    }
    
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetButton.addEventListener('click', resetGame);
    
    // Initialize game
    resetGame();
});