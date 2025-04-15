# Conway's Game of Life Library

A TypeScript library for implementing Conway's Game of Life with a clean API for game manipulation.

## Features

- Modular architecture with separation of game logic and rendering
- Customizable game settings (grid size, speed)
- Customizable rendering options (colors, cell size, grid visibility)
- Built-in patterns (glider, blinker, beacon, etc.)
- Easy-to-use API for manipulating the game state

## Library Structure

- `GameOfLife.ts` - Core game logic and rules
- `Renderer.ts` - Canvas rendering functionality
- `types.ts` - TypeScript type definitions
- `index.ts` - Main entry point with exports and utilities

## Usage Example

```typescript
import { GameOfLife, Renderer, loadPattern, Patterns } from './lib';

// Create a game instance
const game = new GameOfLife({
  rows: 40,
  cols: 40,
  fps: 10
});

// Create a renderer
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const renderer = new Renderer(canvas, game, {
  cellSize: 15,
  staticCellColor: '#3498db',
  changedCellColor: '#e74c3c',
  gridColor: '#ddd',
  backgroundColor: '#fff',
  showGrid: true
});

// Start the game
game.start();

// Load a predefined pattern
loadPattern(game, Patterns.glider, 10, 10);

// Toggle a cell
game.toggleCell({ row: 5, col: 5 });

// Stop the game
game.stop();

// Reset the grid
game.reset();

// Randomize the grid
game.randomize(0.3); // 30% chance of cells being alive
```

## API Reference

### GameOfLife Class

The main class for game logic.

#### Constructor

```typescript
constructor(config: GameConfig)
```

- `config.rows`: Number of rows in the grid
- `config.cols`: Number of columns in the grid
- `config.fps`: Frames per second (optional, default: 10)

#### Methods

- `start()`: Start the simulation
- `stop()`: Stop the simulation
- `reset()`: Clear the grid
- `randomize(probability)`: Fill the grid with random live cells
- `toggleCell(position)`: Toggle a cell between alive and dead
- `setCell(position, state)`: Set a cell to a specific state
- `getCell(position)`: Get the state of a cell
- `updateGrid()`: Manually update the grid to the next generation
- `getGrid()`: Get the current grid
- `getChangedCells()`: Get cells that changed in the last update
- `getDimensions()`: Get the grid dimensions
- `isSimulationRunning()`: Check if the simulation is running
- `setUpdateCallback(callback)`: Set a callback for grid updates
- `setFps(fps)`: Change the simulation speed
- `getFps()`: Get the current simulation speed

### Renderer Class

Handles rendering the game to a canvas.

#### Constructor

```typescript
constructor(canvas: HTMLCanvasElement, game: GameOfLife, config: RenderConfig)
```

- `canvas`: The HTML canvas element to render to
- `game`: A GameOfLife instance
- `config`: Rendering configuration

#### Methods

- `render()`: Render the current state of the game
- `canvasToGridPosition(x, y)`: Convert canvas coordinates to grid position
- `updateConfig(config)`: Update rendering configuration
- `getConfig()`: Get the current rendering configuration

### Utility Functions

- `loadPattern(game, pattern, startRow, startCol)`: Load a pattern into the game

### Predefined Patterns

Access via `Patterns` object:
- `Patterns.glider`: A glider pattern
- `Patterns.blinker`: A blinker oscillator
- `Patterns.beacon`: A beacon oscillator
- `Patterns.toad`: A toad oscillator
- `Patterns.pulsar`: A pulsar oscillator
