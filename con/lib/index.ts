// Game of Life Library - Main Entry Point

export { GameOfLife } from './GameOfLife';
export { Renderer } from './Renderer';
export * from './types';

// Patterns - Common patterns that can be loaded into the game
export const Patterns = {
    // Glider pattern
    glider: [
        { row: 0, col: 1 },
        { row: 1, col: 2 },
        { row: 2, col: 0 },
        { row: 2, col: 1 },
        { row: 2, col: 2 }
    ],
    
    // Blinker pattern (oscillator)
    blinker: [
        { row: 1, col: 0 },
        { row: 1, col: 1 },
        { row: 1, col: 2 }
    ],
    
    // Beacon pattern (oscillator)
    beacon: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 1, col: 0 },
        { row: 2, col: 3 },
        { row: 3, col: 2 },
        { row: 3, col: 3 }
    ],
    
    // Toad pattern (oscillator)
    toad: [
        { row: 1, col: 1 },
        { row: 1, col: 2 },
        { row: 1, col: 3 },
        { row: 2, col: 0 },
        { row: 2, col: 1 },
        { row: 2, col: 2 }
    ],
    
    // Pulsar pattern (oscillator)
    pulsar: [
        // Top left
        { row: 2, col: 4 }, { row: 2, col: 5 }, { row: 2, col: 6 },
        { row: 2, col: 10 }, { row: 2, col: 11 }, { row: 2, col: 12 },
        { row: 4, col: 2 }, { row: 5, col: 2 }, { row: 6, col: 2 },
        { row: 4, col: 7 }, { row: 5, col: 7 }, { row: 6, col: 7 },
        { row: 7, col: 4 }, { row: 7, col: 5 }, { row: 7, col: 6 },
        { row: 7, col: 10 }, { row: 7, col: 11 }, { row: 7, col: 12 },
        // Bottom left
        { row: 9, col: 4 }, { row: 9, col: 5 }, { row: 9, col: 6 },
        { row: 9, col: 10 }, { row: 9, col: 11 }, { row: 9, col: 12 },
        { row: 10, col: 2 }, { row: 11, col: 2 }, { row: 12, col: 2 },
        { row: 10, col: 7 }, { row: 11, col: 7 }, { row: 12, col: 7 },
        { row: 14, col: 4 }, { row: 14, col: 5 }, { row: 14, col: 6 },
        { row: 14, col: 10 }, { row: 14, col: 11 }, { row: 14, col: 12 },
        // Top right
        { row: 4, col: 9 }, { row: 5, col: 9 }, { row: 6, col: 9 },
        { row: 4, col: 14 }, { row: 5, col: 14 }, { row: 6, col: 14 },
        // Bottom right
        { row: 10, col: 9 }, { row: 11, col: 9 }, { row: 12, col: 9 },
        { row: 10, col: 14 }, { row: 11, col: 14 }, { row: 12, col: 14 }
    ]
};

/**
 * Helper function to load a pattern into a game
 * @param game GameOfLife instance
 * @param pattern Array of cell positions to set alive
 * @param startRow Starting row offset
 * @param startCol Starting column offset
 */
export function loadPattern(
    game: GameOfLife, 
    pattern: Array<{row: number, col: number}>, 
    startRow: number = 0, 
    startCol: number = 0
): void {
    // First clear the grid
    game.reset();
    
    // Set the pattern cells
    pattern.forEach(cell => {
        game.setCell({
            row: cell.row + startRow,
            col: cell.col + startCol
        }, 1);
    });
}
