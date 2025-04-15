import { Grid, GameConfig, CellPosition } from './types';

/**
 * GameOfLife class - Core logic for Conway's Game of Life
 */
export class GameOfLife {
    private grid: Grid;
    private changedCells: Grid;
    private rows: number;
    private cols: number;
    private fps: number;
    private isRunning: boolean = false;
    private animationId: number | null = null;
    private lastUpdateTime: number = 0;
    private onUpdate: (() => void) | null = null;

    /**
     * Create a new Game of Life instance
     * @param config Configuration for the game
     */
    constructor(config: GameConfig) {
        this.rows = config.rows;
        this.cols = config.cols;
        this.fps = config.fps || 10;
        this.grid = this.createEmptyGrid();
        this.changedCells = this.createEmptyGrid();
    }

    /**
     * Create an empty grid filled with zeros
     */
    private createEmptyGrid(): Grid {
        return Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
    }

    /**
     * Get the current state of the grid
     */
    public getGrid(): Grid {
        return this.grid;
    }

    /**
     * Get the cells that changed in the last update
     */
    public getChangedCells(): Grid {
        return this.changedCells;
    }

    /**
     * Get the dimensions of the grid
     */
    public getDimensions(): { rows: number, cols: number } {
        return { rows: this.rows, cols: this.cols };
    }

    /**
     * Check if the simulation is currently running
     */
    public isSimulationRunning(): boolean {
        return this.isRunning;
    }

    /**
     * Set a callback function to be called after each grid update
     * @param callback Function to call after grid updates
     */
    public setUpdateCallback(callback: () => void): void {
        this.onUpdate = callback;
    }

    /**
     * Fill the grid with random live cells
     * @param probability Probability of a cell being alive (0-1)
     */
    public randomize(probability: number = 0.3): void {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.grid[i][j] = Math.random() > (1 - probability) ? 1 : 0;
            }
        }
        this.changedCells = this.createEmptyGrid(); // Reset changed cells
        if (this.onUpdate) this.onUpdate();
    }

    /**
     * Reset the grid to empty (all cells dead)
     */
    public reset(): void {
        this.grid = this.createEmptyGrid();
        this.changedCells = this.createEmptyGrid();
        if (this.onUpdate) this.onUpdate();
    }

    /**
     * Toggle the state of a cell (alive/dead)
     * @param position Position of the cell to toggle
     */
    public toggleCell(position: CellPosition): void {
        const { row, col } = position;
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            this.grid[row][col] = this.grid[row][col] ? 0 : 1;
            this.changedCells[row][col] = this.grid[row][col]; // Mark as changed if it becomes alive
            if (this.onUpdate) this.onUpdate();
        }
    }

    /**
     * Set a cell to a specific state
     * @param position Position of the cell
     * @param state State to set (0 for dead, 1 for alive)
     */
    public setCell(position: CellPosition, state: 0 | 1): void {
        const { row, col } = position;
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            const oldState = this.grid[row][col];
            this.grid[row][col] = state;
            this.changedCells[row][col] = oldState !== state ? 1 : 0;
            if (this.onUpdate) this.onUpdate();
        }
    }

    /**
     * Get the state of a specific cell
     * @param position Position of the cell
     * @returns 1 if alive, 0 if dead, or -1 if out of bounds
     */
    public getCell(position: CellPosition): number {
        const { row, col } = position;
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return this.grid[row][col];
        }
        return -1; // Out of bounds
    }

    /**
     * Count the number of live neighbors for a cell
     * @param grid The grid to count neighbors in
     * @param x Row index
     * @param y Column index
     * @returns Number of live neighbors
     */
    private countNeighbors(grid: Grid, x: number, y: number): number {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                
                const row = (x + i + this.rows) % this.rows;
                const col = (y + j + this.cols) % this.cols;
                
                count += grid[row][col];
            }
        }
        return count;
    }

    /**
     * Update the grid based on Conway's Game of Life rules
     */
    public updateGrid(): void {
        const newGrid: Grid = this.createEmptyGrid();
        const newChangedCells: Grid = this.createEmptyGrid();
        
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const neighbors = this.countNeighbors(this.grid, i, j);
                const currentState = this.grid[i][j];
                
                // Apply Conway's Game of Life rules
                if (currentState === 1 && (neighbors < 2 || neighbors > 3)) {
                    newGrid[i][j] = 0; // Cell dies
                    newChangedCells[i][j] = 1; // Mark as changed
                } else if (currentState === 1 && (neighbors === 2 || neighbors === 3)) {
                    newGrid[i][j] = 1; // Cell survives
                } else if (currentState === 0 && neighbors === 3) {
                    newGrid[i][j] = 1; // Cell becomes alive
                    newChangedCells[i][j] = 1; // Mark as changed
                }
            }
        }
        
        this.grid = newGrid;
        this.changedCells = newChangedCells;
        
        if (this.onUpdate) this.onUpdate();
    }

    /**
     * Game loop function
     */
    private gameLoop(timestamp: number): void {
        if (!this.isRunning) return;
        
        const elapsed = timestamp - this.lastUpdateTime;
        
        if (elapsed > 1000 / this.fps) {
            this.updateGrid();
            this.lastUpdateTime = timestamp;
        }
        
        this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
    }

    /**
     * Start the simulation
     */
    public start(): void {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastUpdateTime = performance.now();
            this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
        }
    }

    /**
     * Stop the simulation
     */
    public stop(): void {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Set the frames per second for the simulation
     * @param fps Frames per second
     */
    public setFps(fps: number): void {
        this.fps = fps;
    }

    /**
     * Get the current frames per second setting
     */
    public getFps(): number {
        return this.fps;
    }
}
