const mandelbrotCanvas = document.getElementById('mandelbrotCanvas');
const gameOfLifeCanvas = document.getElementById('gameOfLifeCanvas');
const mandelbrotCtx = mandelbrotCanvas.getContext('2d');
const gameOfLifeCtx = gameOfLifeCanvas.getContext('2d');

const width = mandelbrotCanvas.width;
const height = mandelbrotCanvas.height;

// Mandelbrot Set
function drawMandelbrot(zoom, panX, panY) {
    const maxIterations = 100;
    const imageData = mandelbrotCtx.createImageData(width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const real = (x - width / 2) / zoom + panX;
            const imag = (y - height / 2) / zoom + panY;
            let a = 0, b = 0;
            let iteration = 0;

            while (a * a + b * b < 4 && iteration < maxIterations) {
                const aTemp = a * a - b * b + real;
                b = 2 * a * b + imag;
                a = aTemp;
                iteration++;
            }

            const color = iteration === maxIterations ? 0 : (iteration / maxIterations) * 255;
            const index = (y * width + x) * 4;

            data[index] = color;
            data[index + 1] = color;
            data[index + 2] = color;
            data[index + 3] = 255;
        }
    }

    mandelbrotCtx.putImageData(imageData, 0, 0);
}

// Game of Life
const grid = Array.from({ length: 100 }, () => Array(100).fill(0));
const cellSize = 8;

function randomizeGrid() {
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            grid[y][x] = Math.random() > 0.5 ? 1 : 0;
        }
    }
}

function drawGameOfLife() {
    gameOfLifeCtx.clearRect(0, 0, width, height);

    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            if (grid[y][x] === 1) {
                gameOfLifeCtx.fillStyle = '#fff';
                gameOfLifeCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
}

function updateGameOfLife() {
    const newGrid = Array.from({ length: 100 }, () => Array(100).fill(0));

    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            const neighbors = [
                [y - 1, x - 1], [y - 1, x], [y - 1, x + 1],
                [y, x - 1], [y, x + 1],
                [y + 1, x - 1], [y + 1, x], [y + 1, x + 1]
            ].filter(([ny, nx]) => ny >= 0 && ny < grid.length && nx >= 0 && nx < grid[y].length)
                .reduce((sum, [ny, nx]) => sum + grid[ny][nx], 0);

            if (grid[y][x] === 1 && (neighbors === 2 || neighbors === 3)) {
                newGrid[y][x] = 1;
            } else if (grid[y][x] === 0 && neighbors === 3) {
                newGrid[y][x] = 1;
            } else {
                newGrid[y][x] = 0;
            }
        }
    }

    grid.splice(0, grid.length, ...newGrid);
}

function gameLoop() {
    // Creative interaction: Use the Game of Life grid to influence Mandelbrot zoom
    const liveCells = grid.reduce((sum, row) => sum + row.filter(cell => cell === 1).length, 0);
    const zoomFactor = 1 + (liveCells / 500); // Increase the zoom factor

    // Smooth zoom effect
    let targetZoom = 250 * zoomFactor;

    const zoomSpeed = 10.0; // Further increase the zoom speed

    // Gradually update zoom
    if (zoom > targetZoom) {
        zoom -= zoomSpeed;
    } else if (zoom < targetZoom) {
        zoom += zoomSpeed;
    }

    // Redraw Mandelbrot with updated parameters
    drawMandelbrot(zoom, -0.7, 0);
    drawGameOfLife();
    updateGameOfLife();
    requestAnimationFrame(gameLoop);
}

// Initialize zoom variable
let zoom = 250;

randomizeGrid();
gameLoop();