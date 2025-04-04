import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'; // Old path
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // Correct path

const hud = document.getElementById('hud')!;
const gameover = document.getElementById('gameover')!;
let isGameOver = false;
let hasWon = false;
let currentFloor = 0; // Track player's current floor (0 or 1)
let isVictoryAnimating = false; // Flag for the victory camera orbit
let victoryOrbitAngle = 0; // Angle for the camera orbit

// Dungeon tile types
const TILE_FLOOR = 0;
const TILE_WALL = 1;
const TILE_STAIRS = 2; // Represents stairs going up/down

// Prepare "You Win" sprite (hidden initially)

function updateHUD() {
  // Include floor in HUD
  hud.textContent = `Floor: ${currentFloor} | Health: ${playerHealth} | Score: ${playerScore}`;
}

// Dungeon parameters (declare early for camera centering)
const gridSize = 50;
const cellSize = 2;

// Scene setup
const scene = new THREE.Scene();
const winCanvas = document.createElement('canvas');
winCanvas.width = 512;
winCanvas.height = 128;
const ctx = winCanvas.getContext('2d')!;
ctx.fillStyle = 'lime';
ctx.font = 'bold 64px sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('You Win!', winCanvas.width / 2, winCanvas.height / 2);

const winTexture = new THREE.CanvasTexture(winCanvas);
const winMaterial = new THREE.SpriteMaterial({ map: winTexture, transparent: true });
const winSprite = new THREE.Sprite(winMaterial);
winSprite.scale.set(20, 5, 1);
winSprite.position.set(0, 20, 0);
winSprite.visible = false;
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const centerX = (gridSize / 2) * cellSize;
const centerZ = (gridSize / 2) * cellSize;
camera.position.set(centerX, 30, centerZ + 20);
camera.lookAt(centerX, 0, centerZ);
scene.add(winSprite);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls (optional free camera rotation)
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(centerX, 0, centerZ);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = true;
controls.enableZoom = true;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

// Dungeon parameters
const dungeon: number[][] = []; // Still 2D for layout, but values indicate type

// Initialize all walls
for (let x = 0; x < gridSize; x++) {
  dungeon[x] = [];
  for (let z = 0; z < gridSize; z++) {
    dungeon[x][z] = TILE_WALL; // Use constant
  }
}

// Room placement
const roomCount = 15;
const rooms: { x: number; z: number; w: number; h: number }[] = [];

for (let i = 0; i < roomCount; i++) {
  const w = 4 + Math.floor(Math.random() * 4);
  const h = 4 + Math.floor(Math.random() * 4);
  const x = 1 + Math.floor(Math.random() * (gridSize - w - 2));
  const z = 1 + Math.floor(Math.random() * (gridSize - h - 2));

  // Save room
  rooms.push({ x, z, w, h });

  // Carve room
  for (let dx = 0; dx < w; dx++) {
    for (let dz = 0; dz < h; dz++) {
      dungeon[x + dx][z + dz] = TILE_FLOOR; // Use constant
    }
  }
}

// Place Stairs
const stairCount = 3;
let placedStairs = 0;
while (placedStairs < stairCount) {
    const sx = Math.floor(Math.random() * gridSize);
    const sz = Math.floor(Math.random() * gridSize);
    // Place stairs only on existing floor tiles, not in walls or over existing stairs
    if (dungeon[sx][sz] === TILE_FLOOR) {
        // Ensure it's not blocked on all sides (optional, makes stairs more accessible)
        let accessible = false;
        const neighbors = [[sx+1, sz], [sx-1, sz], [sx, sz+1], [sx, sz-1]];
        for(const [nx, nz] of neighbors) {
            if (nx >= 0 && nx < gridSize && nz >= 0 && nz < gridSize && dungeon[nx][nz] !== TILE_WALL) {
                accessible = true;
                break;
            }
        }
        if (accessible) {
             dungeon[sx][sz] = TILE_STAIRS;
             placedStairs++;
             console.log(`Placed stairs at (${sx}, ${sz})`);
        }
    }
}

const playerMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
let playerX = 1;
let playerZ = 1;
let playerY = 0; // Player starts on floor 0
const player = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), playerMaterial);
// Initial Y position based on floor
player.position.set(playerX * cellSize, 0.5 + playerY * 5, playerZ * cellSize); // Adjust Y based on floor
scene.add(player);

let playerHealth = 10;
let playerScore = 0;

// Find a valid spawn point for player (must be floor or stairs on level 0)
playerX = 1;
playerZ = 1;
do {
  playerX = Math.floor(Math.random() * gridSize);
  playerZ = Math.floor(Math.random() * gridSize);
} while (dungeon[playerX][playerZ] === TILE_WALL); // Spawn on floor or stairs

playerY = 0; // Ensure player starts on floor 0
player.position.set(playerX * cellSize, 0.5 + playerY * 5, playerZ * cellSize); // Set initial position correctly
updateHUD(); // Initial HUD update

const enemyMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const itemMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
const stairMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Green for stairs

// Store Y coordinate for enemies and items
interface GameEntity extends THREE.Mesh {
    yLevel: number;
}

const enemies: GameEntity[] = [];
const debugMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, opacity: 0.5, transparent: true });
const debugIndicator = new THREE.Mesh(new THREE.BoxGeometry(cellSize, 0.1, cellSize), debugMaterial);
debugIndicator.position.set(-9999, 0, -9999); // hide initially
scene.add(debugIndicator);
const items: GameEntity[] = [];

// Spawn enemies (assign random floor)
for (let i = 0; i < 15; i++) {
  let ex = 0, ez = 0, ey = 0;
  do {
    ex = Math.floor(Math.random() * gridSize);
    ez = Math.floor(Math.random() * gridSize);
    ey = Math.floor(Math.random() * 2); // 0 or 1
  } while (dungeon[ex][ez] === TILE_WALL || (ex === playerX && ez === playerZ && ey === playerY)); // Can't spawn in wall or on player start

  const enemy = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), enemyMaterial) as GameEntity;
  enemy.yLevel = ey; // Store floor level
  enemy.position.set(ex * cellSize, 0.5 + ey * 5, ez * cellSize); // Set Y position based on floor
  enemy.visible = (ey === currentFloor); // Initially visible only if on player's floor
  scene.add(enemy);
  enemies.push(enemy);
}

// Spawn items (assign random floor)
for (let i = 0; i < 15; i++) {
  let ix = 0, iz = 0, iy = 0;
  do {
    ix = Math.floor(Math.random() * gridSize);
    iz = Math.floor(Math.random() * gridSize);
    iy = Math.floor(Math.random() * 2); // 0 or 1
  } while (dungeon[ix][iz] === TILE_WALL || (ix === playerX && iz === playerZ && iy === playerY)); // Can't spawn in wall or on player start

  const item = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), itemMaterial) as GameEntity;
  item.yLevel = iy; // Store floor level
  item.position.set(ix * cellSize, 0.5 + iy * 5, iz * cellSize); // Set Y position based on floor
  item.visible = (iy === currentFloor); // Initially visible only if on player's floor
  scene.add(item);
  items.push(item);
}

// Connect rooms with corridors
for (let i = 1; i < rooms.length; i++) {
  const roomB = rooms[i]; // The new room we are connecting

  let nearestRoomA: { x: number; z: number; w: number; h: number } | null = null;
  let minDistSq = Infinity; // Use squared distance to avoid sqrt

  // Find the nearest room among the previously placed ones (j < i)
  for (let j = 0; j < i; j++) {
    const roomA = rooms[j];
    const centerAx = roomA.x + roomA.w / 2;
    const centerAz = roomA.z + roomA.h / 2;
    const centerBx = roomB.x + roomB.w / 2;
    const centerBz = roomB.z + roomB.h / 2;

    const dx = centerAx - centerBx;
    const dz = centerAz - centerBz;
    const distSq = dx * dx + dz * dz; // Squared distance

    if (distSq < minDistSq) {
      minDistSq = distSq;
      nearestRoomA = roomA;
    }
  }

  // Connect roomB to the found nearestRoomA
  if (nearestRoomA) {
    const roomA = nearestRoomA; // Use the nearest room found

    // Get center points of the chosen rooms
    const ax = roomA.x + Math.floor(roomA.w / 2);
    const az = roomA.z + Math.floor(roomA.h / 2);
    const bx = roomB.x + Math.floor(roomB.w / 2);
    const bz = roomB.z + Math.floor(roomB.h / 2);

    // Carve L-shaped corridor (same logic as before)
    if (Math.random() < 0.5) {
      // Horizontal then vertical
      for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) {
        // Ensure we don't carve outside grid bounds (safety check)
        if (x >= 0 && x < gridSize && az >= 0 && az < gridSize && dungeon[x][az] === TILE_WALL) { // Only carve walls
          dungeon[x][az] = TILE_FLOOR;
        }
      }
      for (let z = Math.min(az, bz); z <= Math.max(az, bz); z++) {
         // Ensure we don't carve outside grid bounds (safety check)
         if (bx >= 0 && bx < gridSize && z >= 0 && z < gridSize && dungeon[bx][z] === TILE_WALL) { // Only carve walls
           dungeon[bx][z] = TILE_FLOOR;
         }
      }
    } else {
      // Vertical then horizontal
      for (let z = Math.min(az, bz); z <= Math.max(az, bz); z++) {
         // Ensure we don't carve outside grid bounds (safety check)
         if (ax >= 0 && ax < gridSize && z >= 0 && z < gridSize && dungeon[ax][z] === TILE_WALL) { // Only carve walls
           dungeon[ax][z] = TILE_FLOOR;
         }
      }
      for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) {
         // Ensure we don't carve outside grid bounds (safety check)
         if (x >= 0 && x < gridSize && bz >= 0 && bz < gridSize && dungeon[x][bz] === TILE_WALL) { // Only carve walls
           dungeon[x][bz] = TILE_FLOOR;
         }
      }
    }
  } else {
      // Should not happen if i > 0, but good practice
      console.warn("Could not find a nearest room to connect to for room index:", i);
  }
}

// Floor, walls, and stairs
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
// Re-use stairMaterial defined earlier

// Create geometry for stairs (e.g., a wedge or slanted box)
// Simple slanted box for stairs
const stairGeometry = new THREE.BoxGeometry(cellSize, 0.2, cellSize);
stairGeometry.translate(0, -0.05, 0); // Position slightly lower like floor
// We'll use the material color to indicate stairs

for (let x = 0; x < gridSize; x++) {
  for (let z = 0; z < gridSize; z++) {
    const tileType = dungeon[x][z];
    const yPos = 0; // Base Y position for ground floor elements

    if (tileType === TILE_FLOOR) {
      const floor = new THREE.Mesh(new THREE.BoxGeometry(cellSize, 0.1, cellSize), floorMaterial);
      floor.position.set(x * cellSize, yPos, z * cellSize);
      scene.add(floor);
    } else if (tileType === TILE_STAIRS) {
        // Add floor underneath stairs for visual consistency
        const baseFloor = new THREE.Mesh(new THREE.BoxGeometry(cellSize, 0.1, cellSize), floorMaterial);
        baseFloor.position.set(x * cellSize, yPos, z * cellSize);
        scene.add(baseFloor);
        // Add stair marker mesh
        const stair = new THREE.Mesh(stairGeometry, stairMaterial);
        stair.position.set(x * cellSize, yPos + 0.1, z * cellSize); // Place slightly above base floor
        // stair.rotation.x = -Math.PI / 6; // Optional: slant stairs
        scene.add(stair);
    } else { // TILE_WALL
      // Walls rise from y=0 up to cover both levels visually for now
      const wallHeight = 10; // Make walls tall enough to cover both floors
      const wall = new THREE.Mesh(new THREE.BoxGeometry(cellSize, wallHeight, cellSize), wallMaterial);
      // Position wall centered vertically
      wall.position.set(x * cellSize, yPos + wallHeight / 2 - 0.1, z * cellSize); // Center the tall wall
      scene.add(wall);
    }
  }
}

// Player Y position update
function updatePlayerYPosition() {
    player.position.y = 0.5 + currentFloor * 5; // Adjust Y based on current floor (e.g., 5 units per floor)
    updateHUD();

    // Update visibility of enemies and items
    enemies.forEach(e => e.visible = (e.yLevel === currentFloor));
    items.forEach(i => i.visible = (i.yLevel === currentFloor));
}

// Controls
const keys: Record<string, boolean> = {};
window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  // Use stairs on key press (e.g., 'e')
  if (e.key.toLowerCase() === 'e' && !isGameOver) {
      if (dungeon[playerX][playerZ] === TILE_STAIRS) {
          currentFloor = 1 - currentFloor; // Toggle between 0 and 1
          playerY = currentFloor; // Update player state variable
          console.log(`Used stairs. Moved to floor ${currentFloor}`);
          updatePlayerYPosition();
          // Optional: Add a small sound effect or visual cue
      }
  }
});
window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

// Movement logic
function tryMove(dx: number, dz: number) {
  const newX = playerX + dx;
  const newZ = playerZ + dz;
  if (
    newX >= 0 &&
    newX < gridSize &&
    newZ >= 0 &&
    newZ < gridSize &&
    dungeon[newX][newZ] !== TILE_WALL // Can move on floor or stairs
  ) {
    playerX = newX;
    playerZ = newZ;
    // Only update X and Z position here, Y is handled by stairs
    player.position.set(playerX * cellSize, player.position.y, playerZ * cellSize);
  }
}

// Helper function to find the nearest stair tile to the player
function findNearestStairs(startX: number, startZ: number): [number, number] | null {
    let nearestStairs: [number, number] | null = null;
    let minDistSq = Infinity;

    for (let x = 0; x < gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
            if (dungeon[x][z] === TILE_STAIRS) {
                const dx = startX - x;
                const dz = startZ - z;
                const distSq = dx * dx + dz * dz;
                if (distSq < minDistSq) {
                    minDistSq = distSq;
                    nearestStairs = [x, z];
                }
            }
        }
    }
    return nearestStairs;
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update victory particles if they exist
  const victoryData = (window as any).victoryParticles;
  if (victoryData) {
    const { particles, geometry, velocities, particleCount } = victoryData;
    const positions = geometry.attributes.position.array as Float32Array;
    const velocityData = geometry.attributes.velocity.array as Float32Array;
    const material = particles.material as THREE.PointsMaterial;

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      positions[idx] += velocityData[idx];
      positions[idx + 1] += velocityData[idx + 1];
      positions[idx + 2] += velocityData[idx + 2];

      // Optional: Add gravity or fade out
      velocityData[idx + 1] -= 0.005; // Simple gravity
      if (positions[idx + 1] < 0) { // Reset particles that fall below ground
          positions[idx] = playerX * cellSize + (Math.random() - 0.5) * 20;
          positions[idx + 1] = 10 + Math.random() * 10;
          positions[idx + 2] = playerZ * cellSize + (Math.random() - 0.5) * 20;
          velocityData[idx] = (Math.random() - 0.5) * 0.2;
          velocityData[idx + 1] = Math.random() * 0.3 + 0.1; // More upward velocity
          velocityData[idx + 2] = (Math.random() - 0.5) * 0.2;
      }
    }
    geometry.attributes.position.needsUpdate = true;
    // Optional: Fade out effect
    // material.opacity -= 0.005;
    // if (material.opacity <= 0) {
    //     scene.remove(particles);
    //     delete (window as any).victoryParticles;
    // }
  }


  if (!isGameOver && !hasWon) {
    // --- Autopilot Logic ---
    let targetX: number | null = null;
    let targetZ: number | null = null;
    let isPathingToStairs = false; // Flag to know our current goal

    // 1. Find nearest item ON CURRENT FLOOR
    let nearestItem: GameEntity | null = null;
    let minDistItem = Infinity;
    for (const item of items) {
      if (item.yLevel === currentFloor) {
          // Use XZ distance for pathfinding comparison
          const dx = playerX - Math.floor(item.position.x / cellSize);
          const dz = playerZ - Math.floor(item.position.z / cellSize);
          const distSq = dx*dx + dz*dz; // Use squared distance
          if (distSq < minDistItem) {
            minDistItem = distSq;
            nearestItem = item;
          }
      }
    }

    const itemsOnFloor = items.filter(i => i.yLevel === currentFloor).length;
    console.log(`Gold remaining on floor ${currentFloor}: ${itemsOnFloor} (Total: ${items.length})`);

    // 2. Determine Target: Item or Stairs?
    if (nearestItem) {
        // Target is the nearest item on this floor
        targetX = Math.floor(nearestItem.position.x / cellSize);
        targetZ = Math.floor(nearestItem.position.z / cellSize);
        console.log(`Target: Gold at (${targetX}, ${targetZ}) on floor ${currentFloor}`);
    } else if (items.length > 0) {
        // No items on this floor, but items exist elsewhere. Target nearest stairs.
        const nearestStairsCoords = findNearestStairs(playerX, playerZ);
        if (nearestStairsCoords) {
            targetX = nearestStairsCoords[0];
            targetZ = nearestStairsCoords[1];
            isPathingToStairs = true;
            console.log(`Target: Stairs at (${targetX}, ${targetZ}) on floor ${currentFloor}`);
        } else {
            console.warn("No items on this floor, but couldn't find any stairs!");
            // No target this frame
        }
    } else {
        // No items left anywhere - victory handled elsewhere. No target needed.
        console.log("All items collected or no target.");
    }

    // 3. Pathfind to Target (if a target exists)
    if (targetX !== null && targetZ !== null) {
        // --- Pathfinding Setup ---
        // Build a set of danger tiles (enemy and adjacent) ON CURRENT FLOOR
        const dangerTiles = new Set<string>();
        for (const enemy of enemies) {
            if (enemy.yLevel === currentFloor) { // Only consider enemies on current floor
                const ex = Math.floor(enemy.position.x / cellSize);
                const ez = Math.floor(enemy.position.z / cellSize);
                for (let dx = -1; dx <= 1; dx++) {
                  for (let dz = -1; dz <= 1; dz++) {
                    const tx = ex + dx;
                    const tz = ez + dz;
                    if (tx >= 0 && tx < gridSize && tz >= 0 && tz < gridSize) {
                      dangerTiles.add(`${tx},${tz}`);
                    }
                  }
                }
            }
        }


        // --- Perform BFS (Safe Path) ---
        let nextStep: [number, number] | null = null;
        let pathFound = false; // Flag to know if BFS succeeded

        const visited = new Set<string>();
        const queue: { x: number; z: number; path: Array<[number, number]> }[] = [];
        queue.push({ x: playerX, z: playerZ, path: [] });
        visited.add(`${playerX},${playerZ}`);

        while (queue.length > 0) {
            const { x, z, path } = queue.shift()!;
            const neighbors = [ [x + 1, z], [x - 1, z], [x, z + 1], [x, z - 1] ];

            for (const [nx, nz] of neighbors) {
              if (
                nx >= 0 && nx < gridSize && nz >= 0 && nz < gridSize &&
                dungeon[nx][nz] !== TILE_WALL && // Can move on floor or stairs
                !visited.has(`${nx},${nz}`) &&
                !dangerTiles.has(`${nx},${nz}`) // Avoid danger
              ) {
                const newPath = [...path, [nx, nz]] as Array<[number, number]>;
                if (nx === targetX && nz === targetZ) {
                  nextStep = newPath[0];
                  pathFound = true; // Mark path found
                  break; // Exit inner loop
                }
                queue.push({ x: nx, z: nz, path: newPath });
                visited.add(`${nx},${nz}`);
              }
            }
            if (pathFound) break; // Exit outer loop
        } // End Safe BFS

        // --- Perform BFS (Fallback Path - if safe path failed) ---
        if (!pathFound) {
            console.log('No safe path found, fallback to shortest ignoring enemies');
            visited.clear();
            queue.length = 0;
            queue.push({ x: playerX, z: playerZ, path: [] });
            visited.add(`${playerX},${playerZ}`);
            nextStep = null; // Reset nextStep

            while (queue.length > 0) {
                const { x, z, path } = queue.shift()!;
                const neighbors = [ [x + 1, z], [x - 1, z], [x, z + 1], [x, z - 1] ];

                for (const [nx, nz] of neighbors) {
                  if (
                    nx >= 0 && nx < gridSize && nz >= 0 && nz < gridSize &&
                    dungeon[nx][nz] !== TILE_WALL && // Can move on floor or stairs
                    !visited.has(`${nx},${nz}`) // Ignore danger this time
                  ) {
                    const newPath = [...path, [nx, nz]] as Array<[number, number]>;
                    if (nx === targetX && nz === targetZ) {
                      nextStep = newPath[0];
                      pathFound = true; // Mark path found
                      break; // Exit inner loop
                    }
                    queue.push({ x: nx, z: nz, path: newPath });
                    visited.add(`${nx},${nz}`);
                  }
                }
                if (pathFound) break; // Exit outer loop
            } // End Fallback BFS
        }

        // --- Execute Movement or Stair Use ---
        if (nextStep) {
            const [newX, newZ] = nextStep;
            console.log(`Autopilot moving to: (${newX}, ${newZ}) on floor ${currentFloor}. Target type: ${isPathingToStairs ? 'Stairs' : 'Gold'}`);
            debugIndicator.position.set(targetX * cellSize, 0.05 + currentFloor * 5, targetZ * cellSize); // Point to final target

            // Update player logical position
            playerX = newX;
            playerZ = newZ;
            // Update player visual position (XZ only)
            player.position.set(playerX * cellSize, player.position.y, playerZ * cellSize);

            // Check if we arrived at the target stairs
            if (isPathingToStairs && playerX === targetX && playerZ === targetZ) {
                console.log("Autopilot reached stairs, changing floor.");
                currentFloor = 1 - currentFloor; // Toggle floor
                playerY = currentFloor;
                updatePlayerYPosition(); // Update visuals, HUD, entity visibility
                // Don't need to do anything else this frame, next frame will find new target
            }
        } else {
            console.log(`No path found to target (${targetX}, ${targetZ}) on floor ${currentFloor}.`);
            debugIndicator.position.y = -9999; // Hide debug indicator if no path
        }

    } else {
        // No target this frame (either won, or stuck with no stairs)
        debugIndicator.position.y = -9999; // Hide debug indicator
    }
    // --- End Autopilot Logic ---
  } // End of !isGameOver && !hasWon block

  if (!isGameOver) {
    // Enemy movement (random walk ON THEIR FLOOR)
    for (const enemy of enemies) {
      // Only move enemies on the player's current floor for simplicity now
      if (enemy.yLevel === currentFloor) {
          if (Math.random() < 0.02) {
            const dx = Math.floor(Math.random() * 3) - 1;
            const dz = Math.floor(Math.random() * 3) - 1;
            const ex = Math.round(enemy.position.x / cellSize) + dx;
            const ez = Math.round(enemy.position.z / cellSize) + dz;
            if (
              ex >= 0 && ex < gridSize &&
              ez >= 0 && ez < gridSize &&
              dungeon[ex][ez] !== TILE_WALL // Can move on floor or stairs
            ) {
              // Move enemy only in XZ plane
              enemy.position.set(ex * cellSize, enemy.position.y, ez * cellSize);
            }
          }

          // Check collision with player (only if on same floor)
          if (enemy.position.distanceTo(player.position) < 1) { // Simple distance check works if Y is same
            playerHealth -= 1;
            updateHUD();

            // Teleport player to a safe random floor tile ON CURRENT FLOOR
            let safeX = playerX;
            let safeZ = playerZ;
            let safe = false;
            for (let attempt = 0; attempt < 100; attempt++) {
              const tx = Math.floor(Math.random() * gridSize);
              const tz = Math.floor(Math.random() * gridSize);
              if (dungeon[tx][tz] === TILE_WALL) continue; // Must be floor or stairs

              // Check no enemy nearby ON CURRENT FLOOR
              let enemyNear = false;
              for (const e of enemies) {
                if (e.yLevel === currentFloor) { // Check only enemies on this floor
                    const ex = Math.round(e.position.x / cellSize);
                    const ez = Math.round(e.position.z / cellSize);
                    if (Math.abs(ex - tx) <= 1 && Math.abs(ez - tz) <= 1) {
                      enemyNear = true;
                      break;
                    }
                }
              }
              if (!enemyNear) {
                safeX = tx;
                safeZ = tz;
                safe = true;
                break;
              }
            }
            if (safe) {
              playerX = safeX;
              playerZ = safeZ;
              player.position.set(playerX * cellSize, player.position.y, playerZ * cellSize); // Update XZ only

              console.log(`Teleported to (${playerX}, ${playerZ}) on floor ${currentFloor}`);

              // Update debug indicator (target might change) - logic needs re-evaluation based on new position
              // Re-running the find nearest item logic implicitly handles this on the next frame.
            }

            if (playerHealth <= 0) {
              isGameOver = true;
              gameover.style.display = 'block';
              console.log('Game Over!');
            }
          }
      } // end if enemy.yLevel === currentFloor
    }

    // Check item collection (only if on same floor)
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      // Check Y level and distance
      if (item.yLevel === currentFloor && item.position.distanceTo(player.position) < 1) {
        playerScore += 1;
        updateHUD();
        scene.remove(item); // Remove from scene
        const removedItem = items.splice(i, 1)[0]; // Remove from array
        console.log(`Collected gold. Score: ${playerScore}. Remaining: ${items.length}`);

        // *** CONSOLIDATED VICTORY CHECK (all items collected across all floors) ***
        if (items.length === 0) {
          console.log('VICTORY CONDITION REACHED: all gold collected');
          isGameOver = true; // Stop game logic (like enemy movement)
          hasWon = true;     // Set win state
          isVictoryAnimating = true; // START THE VICTORY CAMERA ORBIT!
          controls.enabled = false; // Disable user controls during orbit
          winSprite.visible = true;
          // ... (set winSprite position) ...

          if (!(window as any).victoryParticles) {
              const particleCount = 1000;
              const positions = new Float32Array(particleCount * 3);
              const velocities = new Float32Array(particleCount * 3);

              for (let p = 0; p < particleCount; p++) {
                  const idx = p * 3;
                  positions[idx] = playerX * cellSize + (Math.random() - 0.5) * 5;
                  positions[idx + 1] = (1 + currentFloor * 5) + Math.random() * 5; // Start near player Y
                  positions[idx + 2] = playerZ * cellSize + (Math.random() - 0.5) * 5;
                  // ... velocities ...
              }

              const geometry = new THREE.BufferGeometry();
              geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
              geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3)); // Store velocities

              const colors = new Float32Array(particleCount * 3);
              for (let p = 0; p < particleCount; p++) {
                const idx = p * 3;
                colors[idx] = Math.random(); // Random colors
                colors[idx + 1] = Math.random();
                colors[idx + 2] = Math.random();
              }
              geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

              const material = new THREE.PointsMaterial({
                vertexColors: true,
                size: 0.5, // Smaller particles
                transparent: true,
                opacity: 1.0,
                // Optional: Blending for a brighter look
                // blending: THREE.AdditiveBlending,
                // depthWrite: false, // Disable depth writing for additive blending
              });
              const particles = new THREE.Points(geometry, material);
              scene.add(particles);

              console.log('Victory particles created');
              (window as any).victoryParticles = { particles, geometry, velocities, particleCount };
          }
        }
      }
    }
  } // End of !isGameOver block for enemy movement and item collection

  // --- Camera Logic ---
  if (isVictoryAnimating) {
      // *** Victory Orbit Camera ***
      const orbitCenter = new THREE.Vector3(
          playerX * cellSize,
          (1 + currentFloor * 5) + 2, // Center orbit slightly above particle start height
          playerZ * cellSize
      );
      const orbitRadius = 25; // How far out to orbit
      const orbitSpeed = 0.005; // How fast to orbit

      victoryOrbitAngle += orbitSpeed; // Increment angle each frame

      // Calculate camera position using trigonometry
      const camX = orbitCenter.x + orbitRadius * Math.cos(victoryOrbitAngle);
      const camZ = orbitCenter.z + orbitRadius * Math.sin(victoryOrbitAngle);
      const camY = orbitCenter.y + 15; // Keep camera elevated

      camera.position.set(camX, camY, camZ);
      camera.lookAt(orbitCenter); // Always look at the center of the celebration
      controls.target.copy(orbitCenter); // Update control target to prevent jump if re-enabled

  } else {
      // *** Normal Top-down Camera Follow ***
      const playerPos = new THREE.Vector3(playerX * cellSize, currentFloor * 5, playerZ * cellSize); // Target Y based on floor
      const desiredOffset = new THREE.Vector3(0, 50, 0); // Height above the target Y
      const desiredPos = playerPos.clone().add(desiredOffset);

      // Smoothly interpolate camera position and target
      camera.position.lerp(desiredPos, 0.1);
      controls.target.lerp(playerPos, 0.1); // Target the player's XZ and floor-based Y
  }

  // Update controls ONLY if not in victory animation (needed for damping)
  if (!isVictoryAnimating) {
      controls.update();
  }
  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});