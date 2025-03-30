document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const status = document.getElementById('status');
    const resetButton = document.getElementById('reset');
    const scoreX = document.getElementById('score-x');
    const scoreO = document.getElementById('score-o');

    let currentPlayer = 'X';
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let scores = { X: 0, O: 0 };
    let powerUpActive = false;
    let powerUpType = null;
    let powerUpCell = null;

    // Create board cells
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', handleCellClick);
        board.appendChild(cell);
    }

    const cells = document.querySelectorAll('.cell');

    // Power-up types and their effects
    const powerUps = {
        extraMove: {
            name: 'Extra Move',
            effect: (player) => {
                status.textContent = `Player ${player} gets an extra move!`;
                powerUpActive = true;
            }
        },
        blockOpponent: {
            name: 'Block Opponent',
            effect: (player) => {
                status.textContent = `Player ${player} blocks opponent's next move!`;
                powerUpActive = true;
            }
        },
        doublePoints: {
            name: 'Double Points',
            effect: (player) => {
                status.textContent = `Player ${player} gets double points for this win!`;
                powerUpActive = true;
            }
        }
    };

    // Check for win condition
    function checkWin() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];

        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                return gameState[a];
            }
        }

        return gameState.includes('') ? null : 'draw';
    }

    // AI makes a random move
    function makeAIMove() {
        status.textContent = "Alien O is thinking...";

        setTimeout(() => {
            const emptyCells = Array.from(cells).filter(cell =>
                cell.textContent === '' && cell !== powerUpCell
            );

            if (emptyCells.length > 0) {
                const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                const index = randomCell.getAttribute('data-index');

                gameState[index] = 'O';
                randomCell.textContent = 'O';
                randomCell.classList.add('o');

                // Check for power-up activation
                if (randomCell === powerUpCell) {
                    const powerUp = powerUps[powerUpType];
                    powerUp.effect('O');
                    showPowerUpEffect(randomCell, powerUp.name);
                    powerUpCell = null;
                }

                // Check for win/draw
                const winner = checkWin();
                if (winner) {
                    handleGameEnd(winner);
                    return;
                }

                currentPlayer = 'X';
                status.textContent = "Player X's turn";

                // Randomly spawn power-up (20% chance)
                if (Math.random() < 0.2 && !powerUpCell) {
                    spawnPowerUp();
                }
            }
        }, 1000);
    }

    // Handle cell click
    function handleCellClick(e) {
        // Only allow player (X) to move when it's their turn
        if (currentPlayer !== 'X') return;

        const index = e.target.getAttribute('data-index');

        // Check if cell is already taken or game is over
        if (gameState[index] !== '' || checkWin() !== null) {
            return;
        }

        // Place player's mark
        gameState[index] = currentPlayer;
        e.target.textContent = currentPlayer;
        e.target.classList.add(currentPlayer.toLowerCase());

        // Check for power-up activation
        if (e.target === powerUpCell) {
            const powerUp = powerUps[powerUpType];
            powerUp.effect(currentPlayer);
            showPowerUpEffect(e.target, powerUp.name);
            powerUpCell = null;
        }

        // Check for win/draw
        const winner = checkWin();
        if (winner) {
            handleGameEnd(winner);
            return;
        }

        // Switch to AI player if no power-up is active
        if (!powerUpActive) {
            currentPlayer = 'O';
            makeAIMove();
        } else {
            powerUpActive = false;
        }

        // Randomly spawn power-up (20% chance)
        if (Math.random() < 0.2 && !powerUpCell) {
            spawnPowerUp();
        }
    }

    // Spawn random power-up on empty cell
    function spawnPowerUp() {
        const emptyCells = Array.from(cells).filter(cell =>
            cell.textContent === '' && cell !== powerUpCell
        );

        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            const powerUpKeys = Object.keys(powerUps);
            powerUpType = powerUpKeys[Math.floor(Math.random() * powerUpKeys.length)];

            randomCell.classList.add('powerup');
            powerUpCell = randomCell;

            // Remove power-up after 5 seconds if not used
            setTimeout(() => {
                if (randomCell === powerUpCell) {
                    randomCell.classList.remove('powerup');
                    powerUpCell = null;
                }
            }, 5000);
        }
    }

    // Show power-up effect animation
    function showPowerUpEffect(cell, powerUpName) {
        const effect = document.createElement('div');
        effect.classList.add('powerup-effect');
        effect.textContent = powerUpName;
        cell.appendChild(effect);

        setTimeout(() => {
            effect.remove();
        }, 1500);
    }

    // Handle game end
    function handleGameEnd(winner) {
        if (winner === 'draw') {
            status.textContent = 'Game ended in a draw!';
        } else {
            // Apply double points if that power-up was active
            const points = powerUpType === 'doublePoints' ? 2 : 1;
            scores[winner] += points;

            if (winner === 'X') {
                scoreX.textContent = scores.X;
            } else {
                scoreO.textContent = scores.O;
            }

            status.textContent = `Player ${winner} wins!`;
        }
    }

    // Reset game
    function resetGame() {
        currentPlayer = 'X';
        gameState = ['', '', '', '', '', '', '', '', ''];
        powerUpActive = false;
        powerUpCell = null;
        status.textContent = `Player ${currentPlayer}'s turn`;

        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
    }

    resetButton.addEventListener('click', resetGame);
});