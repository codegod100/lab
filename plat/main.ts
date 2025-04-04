import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'; // Old path
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // Correct path

const hud = document.getElementById('hud')!;
const gameover = document.getElementById('gameover')!;
let isGameOver = false;
let hasWon = false;

// Prepare "You Win" sprite (hidden initially)

function updateHUD() {
  hud.textContent = `Health: ${playerHealth} | Score: ${playerScore}`;
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
const dungeon: number[][] = [];

// Initialize all walls
for (let x = 0; x < gridSize; x++) {
  dungeon[x] = [];
  for (let z = 0; z < gridSize; z++) {
    dungeon[x][z] = 1;
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
      dungeon[x + dx][z + dz] = 0;
    }
  }
}
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
let playerX = 1;
let playerZ = 1;
const player = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), playerMaterial);
player.position.set(playerX * cellSize, 0.5, playerZ * cellSize);
scene.add(player);


let playerHealth = 10;
let playerScore = 0;

// Find a valid spawn point for player
playerX = 1;
playerZ = 1;
do {
  playerX = Math.floor(Math.random() * gridSize);
  playerZ = Math.floor(Math.random() * gridSize);
} while (dungeon[playerX][playerZ] !== 0);

player.position.set(playerX * cellSize, 0.5, playerZ * cellSize);

const enemyMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const itemMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });

const enemies: THREE.Mesh[] = [];
const debugMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, opacity: 0.5, transparent: true });
const debugIndicator = new THREE.Mesh(new THREE.BoxGeometry(cellSize, 0.1, cellSize), debugMaterial);
debugIndicator.position.set(-9999, 0, -9999); // hide initially
scene.add(debugIndicator);
const items: THREE.Mesh[] = [];

// Spawn enemies
for (let i = 0; i < 15; i++) {
  let ex = 0, ez = 0;
  do {
    ex = Math.floor(Math.random() * gridSize);
    ez = Math.floor(Math.random() * gridSize);
  } while (dungeon[ex][ez] !== 0 || (ex === playerX && ez === playerZ));

  const enemy = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), enemyMaterial);
  enemy.position.set(ex * cellSize, 0.5, ez * cellSize);
  scene.add(enemy);
  enemies.push(enemy);
}

// Spawn items
for (let i = 0; i < 15; i++) {
  let ix = 0, iz = 0;
  do {
    ix = Math.floor(Math.random() * gridSize);
    iz = Math.floor(Math.random() * gridSize);
  } while (dungeon[ix][iz] !== 0 || (ix === playerX && iz === playerZ));

  const item = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), itemMaterial);
  item.position.set(ix * cellSize, 0.5, iz * cellSize);
  scene.add(item);
  items.push(item);
}
// Connect rooms with corridors
for (let i = 1; i < rooms.length; i++) {
  const roomA = rooms[i - 1];
  const roomB = rooms[i];

  const ax = roomA.x + Math.floor(roomA.w / 2);
  const az = roomA.z + Math.floor(roomA.h / 2);
  const bx = roomB.x + Math.floor(roomB.w / 2);
  const bz = roomB.z + Math.floor(roomB.h / 2);

  if (Math.random() < 0.5) {
    // Horizontal then vertical
    for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) {
      dungeon[x][az] = 0;
    }
    for (let z = Math.min(az, bz); z <= Math.max(az, bz); z++) {
      dungeon[bx][z] = 0;
    }
  } else {
    // Vertical then horizontal
    for (let z = Math.min(az, bz); z <= Math.max(az, bz); z++) {
      dungeon[ax][z] = 0;
    }
    for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) {
      dungeon[x][bz] = 0;
    }
  }
}

// Floor and walls
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });

for (let x = 0; x < gridSize; x++) {
  for (let z = 0; z < gridSize; z++) {
    const y = 0;
    if (dungeon[x][z] === 0) {
      const floor = new THREE.Mesh(new THREE.BoxGeometry(cellSize, 0.1, cellSize), floorMaterial);

      floor.position.set(x * cellSize, y, z * cellSize);
      scene.add(floor);
    } else {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(cellSize, cellSize * 2, cellSize), wallMaterial);
      wall.position.set(x * cellSize, cellSize, z * cellSize);
      scene.add(wall);
    }
  }
}

// Player

// Controls
const keys: Record<string, boolean> = {};
window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
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
    dungeon[newX][newZ] === 0
  ) {
    playerX = newX;
    playerZ = newZ;
    player.position.set(playerX * cellSize, 0.5, playerZ * cellSize);
  }
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
          velocityData[idx + 1] = Math.random() * 0.2 + 0.1;
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


  if (!isGameOver && !hasWon) { // Check hasWon here
    // Auto-pilot to nearest gold, avoiding enemies, with BFS pathfinding
    let nearestItem: THREE.Mesh | null = null;
    let minDist = Infinity;

    for (const item of items) {
      const dist = item.position.distanceTo(player.position);
      if (dist < minDist) {
        minDist = dist;
        nearestItem = item;
      }
    }

    console.log(`Gold remaining: ${items.length}`);
    if (nearestItem) {
      const targetX = Math.floor(nearestItem.position.x / cellSize);
      const targetZ = Math.floor(nearestItem.position.z / cellSize);
      console.log(`Target gold at (${targetX}, ${targetZ}), player at (${playerX}, ${playerZ})`);

      // Build a set of danger tiles (enemy and adjacent)
      const dangerTiles = new Set<string>();
      for (const enemy of enemies) {
        const ex = Math.floor(enemy.position.x / cellSize);
        const ez = Math.floor(enemy.position.z / cellSize);
        for (let dx = -1; dx <= 1; dx++) {
          for (let dz = -1; dz <= 1; dz++) {
            const tx = ex + dx;
            const tz = ez + dz;
            if (
              tx >= 0 && tx < gridSize &&
              tz >= 0 && tz < gridSize
            ) {
              dangerTiles.add(`${tx},${tz}`);
            }
          }
        }
      }

      // BFS pathfinding avoiding danger tiles
      const visited = new Set<string>();
      const queue: { x: number; z: number; path: Array<[number, number]> }[] = [];
      queue.push({ x: playerX, z: playerZ, path: [] });
      visited.add(`${playerX},${playerZ}`);

      let nextStep: [number, number] | null = null;

      while (queue.length > 0) {
        const { x, z, path } = queue.shift()!;
        const neighbors = [
          [x + 1, z],
          [x - 1, z],
          [x, z + 1],
          [x, z - 1],
        ];

        for (const [nx, nz] of neighbors) {
          if (
            nx >= 0 && nx < gridSize &&
            nz >= 0 && nz < gridSize &&
            dungeon[nx][nz] === 0 &&
            !visited.has(`${nx},${nz}`) &&
            !dangerTiles.has(`${nx},${nz}`)
          ) {
            const newPath = [...path, [nx, nz]] as Array<[number, number]>;
            if (nx === targetX && nz === targetZ) {
              nextStep = newPath[0];
              break;
            }
            queue.push({ x: nx, z: nz, path: newPath });
            visited.add(`${nx},${nz}`);
          }
        }
        if (nextStep) break;
      }

      if (nextStep) {
        const [newX, newZ] = nextStep;
        console.log(`Next BFS step (avoiding enemies): (${newX}, ${newZ})`);
        debugIndicator.position.set(newX * cellSize, 0.05, newZ * cellSize);
        playerX = newX;
        playerZ = newZ;
        player.position.set(playerX * cellSize, 0.5, playerZ * cellSize);
      } else {
        console.log('No safe path found, fallback to shortest ignoring enemies');

        // Fallback BFS ignoring danger tiles
        visited.clear();
        queue.length = 0;
        queue.push({ x: playerX, z: playerZ, path: [] });
        visited.add(`${playerX},${playerZ}`);
        nextStep = null;

        while (queue.length > 0) {
          const { x, z, path } = queue.shift()!;
          const neighbors = [
            [x + 1, z],
            [x - 1, z],
            [x, z + 1],
            [x, z - 1],
          ];

          for (const [nx, nz] of neighbors) {
            if (
              nx >= 0 && nx < gridSize &&
              nz >= 0 && nz < gridSize &&
              dungeon[nx][nz] === 0 &&
              !visited.has(`${nx},${nz}`)
            ) {
              const newPath = [...path, [nx, nz]] as Array<[number, number]>;
              if (nx === targetX && nz === targetZ) {
                nextStep = newPath[0];
                break;
              }
              queue.push({ x: nx, z: nz, path: newPath });
              visited.add(`${nx},${nz}`);
            }
          }
          if (nextStep) break;
        }

        if (nextStep) {
          const [newX, newZ] = nextStep;
          console.log(`Next fallback BFS step: (${newX}, ${newZ})`);
          debugIndicator.position.set(newX * cellSize, 0.05, newZ * cellSize);
          playerX = newX;
          playerZ = newZ;
          player.position.set(playerX * cellSize, 0.5, playerZ * cellSize);
        } else {
          console.log('No path found to nearest gold');
        }
      }
    }
  } // End of !isGameOver && !hasWon block for autopilot

  if (!isGameOver) {
    // Enemy movement (random walk)
    for (const enemy of enemies) {
      if (Math.random() < 0.02) {
        const dx = Math.floor(Math.random() * 3) - 1;
        const dz = Math.floor(Math.random() * 3) - 1;
        const ex = Math.round(enemy.position.x / cellSize) + dx;
        const ez = Math.round(enemy.position.z / cellSize) + dz;
        if (
          ex >= 0 && ex < gridSize &&
          ez >= 0 && ez < gridSize &&
          dungeon[ex][ez] === 0
        ) {
          enemy.position.set(ex * cellSize, 0.5, ez * cellSize);
        }
      }

      // Check collision with player
      if (enemy.position.distanceTo(player.position) < 1) {
        playerHealth -= 1;
        updateHUD();

        // Teleport player to a safe random floor tile
        let safeX = playerX;
        let safeZ = playerZ;
        let safe = false;
        for (let attempt = 0; attempt < 100; attempt++) {
          const tx = Math.floor(Math.random() * gridSize);
          const tz = Math.floor(Math.random() * gridSize);
          if (dungeon[tx][tz] !== 0) continue;

          // Check no enemy nearby
          let enemyNear = false;
          for (const e of enemies) {
            const ex = Math.round(e.position.x / cellSize);
            const ez = Math.round(e.position.z / cellSize);
            if (Math.abs(ex - tx) <= 1 && Math.abs(ez - tz) <= 1) {
              enemyNear = true;
              break;
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
          player.position.set(playerX * cellSize, 0.5, playerZ * cellSize);

          console.log(`Teleported to (${playerX}, ${playerZ})`);

          // Update debug indicator to new nearest gold
          let nearestItem: THREE.Mesh | null = null;
          let minDist = Infinity;
          for (const item of items) {
            const dist = item.position.distanceTo(player.position);
            if (dist < minDist) {
              minDist = dist;
              nearestItem = item;
            }
          }
          if (nearestItem) {
            const itemX = Math.floor(nearestItem.position.x / cellSize);
            const itemZ = Math.floor(nearestItem.position.z / cellSize);
            debugIndicator.position.set(itemX * cellSize, 0.05, itemZ * cellSize);
            console.log(`New target after teleport: (${itemX}, ${itemZ})`);
          }
        }

        if (playerHealth <= 0) {
          isGameOver = true;
          gameover.style.display = 'block';
          console.log('Game Over!');
        }
      }
    }

    // Check item collection
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (item.position.distanceTo(player.position) < 1) {
        playerScore += 1;
        updateHUD();
        scene.remove(item);
        items.splice(i, 1);
        console.log(`Collected gold. Score: ${playerScore}. Remaining: ${items.length}`);

        // *** CONSOLIDATED VICTORY CHECK ***
        if (items.length === 0) {
          console.log('VICTORY CONDITION REACHED: all gold collected');
          isGameOver = true; // Stop game logic
          hasWon = true;     // Set win state
          winSprite.visible = true;
          winSprite.position.set(playerX * cellSize, 5, playerZ * cellSize);
          console.log('Triggering win screen and particles');

          // Create victory particles (only once)
          if (!(window as any).victoryParticles) {
              const particleCount = 1000;
              const positions = new Float32Array(particleCount * 3);
              const velocities = new Float32Array(particleCount * 3);

              for (let p = 0; p < particleCount; p++) {
                const idx = p * 3;
                positions[idx] = playerX * cellSize + (Math.random() - 0.5) * 5; // Start closer
                positions[idx + 1] = 1 + Math.random() * 5; // Start near player
                positions[idx + 2] = playerZ * cellSize + (Math.random() - 0.5) * 5; // Start closer

                velocities[idx] = (Math.random() - 0.5) * 0.2;
                velocities[idx + 1] = Math.random() * 0.3 + 0.1; // More upward velocity
                velocities[idx + 2] = (Math.random() - 0.5) * 0.2;
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

              // Store for animation in main loop
              console.log('Victory particles created');
              (window as any).victoryParticles = { particles, geometry, velocities, particleCount };
          }
          // No need to break here, let the loop finish checking other items (though there shouldn't be any)
        }
      }
    }
  } // End of !isGameOver block for enemy movement and item collection

  // Top-down camera follow (runs even if game is over to keep focus)
  const playerPos = new THREE.Vector3(playerX * cellSize, 0, playerZ * cellSize);

  const desiredOffset = new THREE.Vector3(0, 50, 0); // directly above
  const desiredPos = playerPos.clone().add(desiredOffset);

  camera.position.lerp(desiredPos, 0.1);

  controls.target.lerp(playerPos, 0.1);

  controls.update();
  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});