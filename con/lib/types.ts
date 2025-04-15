// Game of Life Library Types

export type Grid = number[][];

export interface GameConfig {
    rows: number;
    cols: number;
    fps?: number;
}

export interface RenderConfig {
    cellSize: number;
    staticCellColor: string;
    changedCellColor: string;
    gridColor: string;
    backgroundColor: string;
    showGrid?: boolean;
}

export interface CellPosition {
    row: number;
    col: number;
}
