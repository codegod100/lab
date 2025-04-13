self.addEventListener('message', function(e) {
  const boardSize = 4;
  const targetBoard = Array.from({ length: boardSize }, (_, y) =>
    Array.from({ length: boardSize }, (_, x) =>
      y === 3 && x === 3 ? 0 : y * boardSize + x + 1,
    ),
  );

  function isEqual(board1, board2) {
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        if (board1[y][x] !== board2[y][x]) {
          return false;
        }
      }
    }
    return true;
  }

  function heuristic(board) {
    let cost = 0;
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        if (board[y][x] !== 0) {
          const { x: targetX, y: targetY } = getTargetPosition(board[y][x]);
          cost += Math.abs(x - targetX) + Math.abs(y - targetY);
        }
      }
    }
    return cost;
  }

  function getTargetPosition(value) {
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        if (targetBoard[y][x] === value) {
          return { x, y };
        }
      }
    }
    return { x: -1, y: -1 };
  }

  function getNeighbors(board, emptyTile) {
    const neighbors = [];
    const { x, y } = emptyTile;

    const directions = [
      { dx: 0, dy: -1 }, // Up
      { dx: 0, dy: 1 },  // Down
      { dx: -1, dy: 0 }, // Left
      { dx: 1, dy: 0 }   // Right
    ];

    for (const { dx, dy } of directions) {
      const newX = x + dx;
      const newY = y + dy;

      if (newX >= 0 && newX < boardSize && newY >= 0 && newY < boardSize) {
        const newBoard = JSON.parse(JSON.stringify(board));
        [newBoard[y][x], newBoard[newY][newX]] = [newBoard[newY][newX], newBoard[y][x]];
        neighbors.push({ board: newBoard, emptyTile: { x: newX, y: newY } });
      }
    }

    return neighbors;
  }

  function aStar(startBoard, startEmptyTile) {
    const openSet = [];
    const cameFrom = {};
    const gScore = {};
    const fScore = {};

    gScore[startBoard.toString()] = 0;
    fScore[startBoard.toString()] = heuristic(startBoard);
    openSet.push({ board: startBoard, emptyTile: startEmptyTile, f: fScore[startBoard.toString()] });

    while (openSet.length > 0) {
      openSet.sort((a, b) => a.f - b.f);
      const currentNode = openSet.shift();
      const currentBoard = currentNode.board;
      const currentEmptyTile = currentNode.emptyTile;

      if (isEqual(currentBoard, targetBoard)) {
        const path = [];
        let current = currentBoard.toString();
        while (cameFrom[current]) {
          path.unshift(currentBoard);
          current = cameFrom[current].board.toString();
          currentBoard = cameFrom[current].board;
          currentEmptyTile = cameFrom[current].emptyTile;
        }
        path.unshift(currentBoard);
        return path;
      }

      const neighbors = getNeighbors(currentBoard, currentEmptyTile);

      for (const neighbor of neighbors) {
        const { board: neighborBoard, emptyTile: neighborEmptyTile } = neighbor;
        const tentativeGScore = gScore[currentBoard.toString()] + 1;

        if (!gScore[neighborBoard.toString()] || tentativeGScore < gScore[neighborBoard.toString()]) {
          cameFrom[neighborBoard.toString()] = { board: currentBoard, emptyTile: currentEmptyTile };
          gScore[neighborBoard.toString()] = tentativeGScore;
          fScore[neighborBoard.toString()] = tentativeGScore + heuristic(neighborBoard);
          if (!openSet.some(node => node.board.toString() === neighborBoard.toString())) {
            openSet.push({ board: neighborBoard, emptyTile: neighborEmptyTile, f: fScore[neighborBoard.toString()] });
          }
        }
      }
    }

    return null;
  }

  const path = aStar(e.data.board, e.data.emptyTile);
  self.postMessage(path);
});
