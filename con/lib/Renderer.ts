import { GameOfLife } from './GameOfLife';
import { RenderConfig } from './types';

/**
 * Renderer class - Handles rendering the Game of Life to a canvas
 */
export class Renderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private game: GameOfLife;
    private config: RenderConfig;

    /**
     * Create a new Renderer
     * @param canvas Canvas element to render to
     * @param game GameOfLife instance to render
     * @param config Rendering configuration
     */
    constructor(canvas: HTMLCanvasElement, game: GameOfLife, config: RenderConfig) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.game = game;
        this.config = {
            showGrid: true,
            ...config
        };

        // Set canvas size based on game dimensions and cell size
        const { rows, cols } = game.getDimensions();
        this.canvas.width = cols * this.config.cellSize;
        this.canvas.height = rows * this.config.cellSize;

        // Set up the game to call our render method when it updates
        this.game.setUpdateCallback(this.render.bind(this));
    }

    /**
     * Render the current state of the game to the canvas
     */
    public render(): void {
        const { rows, cols } = this.game.getDimensions();
        const grid = this.game.getGrid();
        const changedCells = this.game.getChangedCells();
        
        // Clear canvas
        this.ctx.fillStyle = this.config.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw cells
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (grid[i][j] === 1) {
                    // Choose color based on whether the cell changed recently
                    this.ctx.fillStyle = changedCells[i][j] === 1 
                        ? this.config.changedCellColor 
                        : this.config.staticCellColor;
                    this.ctx.fillRect(
                        j * this.config.cellSize, 
                        i * this.config.cellSize, 
                        this.config.cellSize - 1, 
                        this.config.cellSize - 1
                    );
                }
            }
        }
        
        // Draw grid lines (if enabled)
        if (this.config.showGrid) {
            this.drawGridLines();
        }
    }

    /**
     * Draw grid lines on the canvas
     */
    private drawGridLines(): void {
        const { rows, cols } = this.game.getDimensions();
        
        this.ctx.strokeStyle = this.config.gridColor;
        this.ctx.lineWidth = 0.5;
        
        // Vertical lines
        for (let i = 0; i <= cols; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.config.cellSize, 0);
            this.ctx.lineTo(i * this.config.cellSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let i = 0; i <= rows; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.config.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.config.cellSize);
            this.ctx.stroke();
        }
    }

    /**
     * Convert canvas coordinates to grid position
     * @param x X coordinate on canvas
     * @param y Y coordinate on canvas
     * @returns Grid position {row, col}
     */
    public canvasToGridPosition(x: number, y: number): { row: number, col: number } {
        return {
            row: Math.floor(y / this.config.cellSize),
            col: Math.floor(x / this.config.cellSize)
        };
    }

    /**
     * Update the rendering configuration
     * @param config New configuration (partial)
     */
    public updateConfig(config: Partial<RenderConfig>): void {
        this.config = { ...this.config, ...config };
        this.render();
    }

    /**
     * Get the current rendering configuration
     */
    public getConfig(): RenderConfig {
        return { ...this.config };
    }
}
