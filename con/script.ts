import { GameOfLife, Renderer } from './lib';
import type { GameConfig, RenderConfig } from './lib';

document.addEventListener('DOMContentLoaded', () => {
    // Canvas setup
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

    // Game configuration
    const gameConfig: GameConfig = {
        rows: 40,
        cols: 40,
        fps: 10
    };

    // Renderer configuration
    const renderConfig: RenderConfig = {
        cellSize: 15,
        staticCellColor: '#3498db',  // Blue for static live cells
        changedCellColor: '#e74c3c', // Red for recently changed cells
        gridColor: '#ddd',
        backgroundColor: '#fff',
        showGrid: true
    };

    // Create game instance
    const game = new GameOfLife(gameConfig);

    // Create renderer
    const renderer = new Renderer(canvas, game, renderConfig);

    // Event listeners for buttons
    document.getElementById('start')?.addEventListener('click', () => game.start());
    document.getElementById('stop')?.addEventListener('click', () => game.stop());
    document.getElementById('reset')?.addEventListener('click', () => {
        game.stop();
        game.reset();
    });
    document.getElementById('random')?.addEventListener('click', () => {
        game.stop();
        game.randomize(0.3); // 30% chance of cells being alive
    });

    // Handle canvas clicks to toggle cells
    canvas.addEventListener('click', (event: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Convert canvas coordinates to grid position
        const position = renderer.canvasToGridPosition(x, y);

        // Toggle the cell
        game.toggleCell(position);
    });

    // Initialize with empty grid and render it
    renderer.render();

    // Example of how to load a pattern (commented out)
    // loadPattern(game, Patterns.glider, 10, 10);
});
