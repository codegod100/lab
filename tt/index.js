// index.js
import * as THREE from './node_modules/three/build/three.module.js';
import { World, Player, Obstacle, generateTreePositions } from './game.js'; // Import game logic classes

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const clock = new THREE.Clock(); // Clock for delta time
renderer.setSize(window.innerWidth, window.innerHeight);

// Append renderer to the container div
const container = document.getElementById('game-container');
if (container) {
    container.appendChild(renderer.domElement);
} else {
    console.error("Game container not found!");
    // Fallback: append to body if container is missing
    document.body.appendChild(renderer.domElement);
}


// Basic lighting
const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Ground Plane
const groundGeometry = new THREE.PlaneGeometry(50, 50); // Large plane
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22, side: THREE.DoubleSide }); // Forest green
const groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
groundPlane.rotation.x = -Math.PI / 2; // Rotate to be horizontal
groundPlane.position.y = -0.5; // Position slightly below player/entities centered at y=0
scene.add(groundPlane);


// Game World Setup
const world = new World();
const fallingTrees = []; // Array to manage trees during their fall animation

// Axe Animation State
let isAxeSwinging = false;
let axeSwingProgress = 0; // 0 to 1
const axeSwingDuration = 0.3; // seconds
const axeSwingAngle = -Math.PI / 2; // Swing angle in radians

// Critter Setup
const critterGeometry = new THREE.SphereGeometry(0.15, 8, 8); // Small sphere
const critterMaterial = new THREE.MeshStandardMaterial({ color: 0xff4500 }); // OrangeRed
const activeCritters = []; // Array to manage active critters

// Player Setup
const player = new Player(); // Instantiate player logic
// Use a cylinder for a more character-like shape
const playerRadius = 0.4;
const playerHeight = 1.5;
const playerGeometry = new THREE.CylinderGeometry(playerRadius, playerRadius, playerHeight, 16); // radiusTop, radiusBottom, height, radialSegments
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Green
const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
playerMesh.position.y = playerHeight / 2 - 0.5; // Adjust y so bottom is near y=-0.5 (ground)
// player.mesh = playerMesh; // Optional: Link mesh back to logic object

// Create Axe
const axeGroup = new THREE.Group();
const handleHeight = 1.2;
const handleRadius = 0.08;
const handleGeometry = new THREE.CylinderGeometry(handleRadius, handleRadius, handleHeight, 8);
const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown
const handleMesh = new THREE.Mesh(handleGeometry, handleMaterial);
handleMesh.position.y = handleHeight / 2; // Position handle relative to group center
axeGroup.add(handleMesh);

const headWidth = 0.5;
const headHeight = 0.4;
const headDepth = 0.15;
const headGeometry = new THREE.BoxGeometry(headWidth, headHeight, headDepth);
const headMaterial = new THREE.MeshStandardMaterial({ color: 0xC0C0C0 }); // Silver
const headMesh = new THREE.Mesh(headGeometry, headMaterial);
headMesh.position.y = handleHeight; // Position head at the top of the handle
headMesh.position.x = headWidth / 2 - handleRadius; // Offset slightly along handle radius
headMesh.rotation.z = Math.PI / 12; // Slight angle
axeGroup.add(headMesh);

// Position Axe relative to player (e.g., in hand)
axeGroup.position.x = playerRadius + 0.1; // To the side of the player cylinder
axeGroup.position.y = 0.5; // Roughly hand height
axeGroup.rotation.z = -Math.PI / 4; // Angle the axe

// Add axe to player mesh
playerMesh.add(axeGroup);


playerMesh.position.copy(player.position); // Set initial mesh position
scene.add(playerMesh);
world.setPlayer(player); // Add player to the world

// Tree Setup Function
const treeTrunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown
const treeLeavesMaterial = new THREE.MeshStandardMaterial({ color: 0x006400 }); // Dark Green
const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8); // radiusTop, radiusBottom, height, radialSegments
const leavesGeometry = new THREE.ConeGeometry(1, 2, 8); // radius, height, radialSegments

export function createTree(position, size = 1.0, health = 3) {
    const tree = new THREE.Group();

    // Apply random size variation (0.8 to 1.5 scale)
    const treeSize = size * (0.8 + Math.random() * 0.7);

    // Random health (1-5 hits)
    const treeHealth = health || Math.floor(1 + Math.random() * 5);

    // Random color variation for leaves
    const leavesHue = 0.3 + Math.random() * 0.2; // Green hue range
    const leavesColor = new THREE.Color().setHSL(leavesHue, 0.8, 0.3);
    const leavesMaterial = new THREE.MeshStandardMaterial({
        color: leavesColor,
        flatShading: true
    });

    // Trunk with size scaling
    const trunk = new THREE.Mesh(trunkGeometry, treeTrunkMaterial);
    trunk.scale.set(treeSize, treeSize, treeSize);
    trunk.position.y = 0.75 * treeSize; // Position trunk relative to size
    tree.add(trunk);

    // Leaves with size scaling
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.scale.set(treeSize, treeSize, treeSize);
    leaves.position.y = (1.5 + 1) * treeSize; // Position scaled leaves
    tree.add(leaves);

    // Position the whole tree group
    tree.position.set(position.x, position.y, position.z);
    scene.add(tree);

    // Create obstacle with health and size
    const treeObstacle = new Obstacle(position, treeHealth, treeSize);
    treeObstacle.mesh = tree; // Link the mesh group to the logical object
    treeObstacle.initialRotation = tree.quaternion.clone(); // Store initial rotation
    world.addEntity(treeObstacle);

    return tree; // Return the group if needed
}

// Procedurally generate trees
export function generateTrees(count = 20, areaSize = 40) {
    const positions = generateTreePositions(count, areaSize);
    positions.forEach(pos => {
        let size = 1.0;
        let health = null;

        if (Math.random() > 0.9) {
            if (Math.random() > 0.5) {
                size = 1.5 + Math.random() * 0.5;
                health = 5 + Math.floor(Math.random() * 3);
            } else {
                size = 0.5 + Math.random() * 0.3;
                health = 1 + Math.floor(Math.random() * 2);
            }
        }

        createTree(pos, size, health);
    });
}

// Generate initial trees
generateTrees(30, 50);


// Camera position (Top-down / Isometric-ish)
const cameraOffset = new THREE.Vector3(0, 5, 10); // Store offset for reuse
camera.position.copy(cameraOffset); // Set initial position

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta(); // Get time since last frame

    // Axe Swing Animation
    if (isAxeSwinging) {
        axeSwingProgress += deltaTime / axeSwingDuration;
        // Use a curve that goes from 0 -> 1 -> 0 for the swing motion
        const swingPhase = Math.sin(axeSwingProgress * Math.PI);
        // Combine Z-axis (sideways) and Y-axis (down/forward) rotation for a diagonal chop
        const currentAngle = swingPhase * axeSwingAngle;
        axeGroup.rotation.set(0, currentAngle, currentAngle); // Apply rotation on Y and Z

        if (axeSwingProgress >= 1.0) {
            isAxeSwinging = false;
            axeSwingProgress = 0;
            axeGroup.rotation.x = 0; // Reset rotation
        }
    }


    const moveSpeed = 0.1; // Adjust speed as needed
    let dx = 0;
    let dz = 0;

    // Determine movement direction based on input
    if (keyState['ArrowUp']) {
        dz -= moveSpeed;
    }
    if (keyState['ArrowDown']) {
        dz += moveSpeed;
    }
    if (keyState['ArrowLeft']) {
        dx -= moveSpeed;
    }
    if (keyState['ArrowRight']) {
        dx += moveSpeed;
    }

    // Update player logic position using the move method
    if (dx !== 0 || dz !== 0) {
        player.move(dx, 0, dz); // Assuming movement only on XZ plane
    }

    // Update player mesh position based on player logic
    playerMesh.position.set(player.position.x, player.position.y, player.position.z);

    // Future: Update world state (e.g., entity AI, physics)
    // world.update(deltaTime); // Need to calculate deltaTime

    // Animate falling trees
    for (let i = fallingTrees.length - 1; i >= 0; i--) {
        const falling = fallingTrees[i];
        falling.currentRotation += falling.speed;

        if (falling.currentRotation >= falling.targetRotation) {
            // Animation finished, remove tree from scene
            scene.remove(falling.mesh);
            // Optional: Dispose geometry/material
            // falling.mesh.traverse(child => { ... });
            fallingTrees.splice(i, 1); // Remove from animation list
        } else {
            // Apply rotation smoothly from current tilt to target fall angle
            // We need the initial rotation (when it started falling, potentially tilted)
            // and apply the additional fall rotation based on progress.
            // For simplicity, let's just rotate directly on the fall axis for now,
            // assuming the tilt was minor or we reset it visually before fall.
            // A more robust solution would use quaternions to combine tilt + fall.
            falling.mesh.setRotationFromAxisAngle(falling.axis, falling.currentRotation); // Keep simple rotation for now
        }
    }

    // Animate active critters
    for (let i = activeCritters.length - 1; i >= 0; i--) {
        const critter = activeCritters[i];
        critter.life -= deltaTime;

        if (critter.life <= 0) {
            // Remove critter
            scene.remove(critter.mesh);
            // Optional: Dispose geometry/material if needed
            activeCritters.splice(i, 1);
        } else {
            // Move critter
            critter.mesh.position.addScaledVector(critter.direction, critter.speed);
            // Optional: Add slight bounce or other movement variation
        }
    }

    // Update camera position to follow player
    camera.position.x = player.position.x + cameraOffset.x;
    camera.position.y = player.position.y + cameraOffset.y; // Keep height offset
    camera.position.z = player.position.z + cameraOffset.z;
    camera.lookAt(playerMesh.position); // Look at the player's mesh

    renderer.render(scene, camera);
}

// Handle window resize (using container dimensions)
function onResize() {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}
window.addEventListener('resize', onResize, false);
// Initial call to set size based on container
onResize();

// Keyboard input handling
const keyState = {};
window.addEventListener('keydown', (event) => {
    keyState[event.code] = true; // For movement

    // Handle attack on Spacebar press
    if (event.code === 'Space') {
        event.preventDefault(); // Prevent default spacebar action (scrolling)
        handlePlayerAttack();
    }
});
window.addEventListener('keyup', (event) => {
    keyState[event.code] = false; // For movement
});

// Attack logic
function handlePlayerAttack() {
    if (isAxeSwinging) return; // Don't attack if already swinging

    console.log("Player attacks!");
    isAxeSwinging = true; // Start the swing animation
    axeSwingProgress = 0; // Reset progress

    const attackRange = 2.0; // How close the player needs to be to hit
    const playerPos = player.position; // Use the logical player position

    // Iterate backwards because we might remove elements
    for (let i = world.entities.length - 1; i >= 0; i--) {
        const entity = world.entities[i];
        const entityPos = entity.position;

        // Simple distance check on the XZ plane
        const dx = playerPos.x - entityPos.x;
        const dz = playerPos.z - entityPos.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance <= attackRange) {
            console.log("Hit entity!", entity);

            const isDestroyed = entity.takeDamage(1); // Apply 1 damage

            if (isDestroyed) {
                // Start falling animation if health is 0
                if (entity.mesh) {
                    // Determine fall direction (away from player for simplicity)
                    const fallDirection = new THREE.Vector3().subVectors(entity.position, playerPos).normalize();
                    const rotationAxis = new THREE.Vector3().crossVectors(THREE.Object3D.DEFAULT_UP, fallDirection).normalize();
                    if (rotationAxis.lengthSq() === 0) rotationAxis.set(1, 0, 0); // Default axis

                    fallingTrees.push({
                        mesh: entity.mesh,
                        axis: rotationAxis,
                        targetRotation: Math.PI / 2,
                        currentRotation: entity.mesh.rotation.z, // Start from current tilt
                        speed: 0.05
                    });
                }
                // Remove entity from world logic
                world.entities.splice(i, 1);

                // Spawn critters proportional to tree size
                const critterCount = Math.max(3, Math.floor(entity.size * 5)); // 3-8 critters based on size
                const spawnPosition = entity.position; // Spawn near the tree base
                for (let j = 0; j < critterCount; j++) {
                    const critterMesh = new THREE.Mesh(critterGeometry, critterMaterial);
                    critterMesh.position.copy(spawnPosition);
                    critterMesh.position.y = 0.1; // Start slightly above ground

                    // Random scatter direction (on XZ plane)
                    const scatterAngle = Math.random() * Math.PI * 2;
                    const scatterDirection = new THREE.Vector3(Math.cos(scatterAngle), 0, Math.sin(scatterAngle));
                    const scatterSpeed = 0.05 + Math.random() * 0.05; // Random speed

                    activeCritters.push({
                        mesh: critterMesh,
                        direction: scatterDirection,
                        speed: scatterSpeed,
                        life: 2.0 // Seconds before disappearing
                    });
                    scene.add(critterMesh);
                }

            } else {
                // Apply progressive tilt if not destroyed
                if (entity.mesh && entity.initialRotation) {
                    const healthPercent = entity.currentHealth / entity.maxHealth;
                    const maxTiltAngle = Math.PI / 16; // Max tilt before falling (adjust as needed)
                    const currentTilt = (1 - healthPercent) * maxTiltAngle;

                    // Tilt away from the player
                    const tiltDirection = new THREE.Vector3().subVectors(entity.position, playerPos).normalize();
                    const tiltAxis = new THREE.Vector3().crossVectors(THREE.Object3D.DEFAULT_UP, tiltDirection).normalize();
                    if (tiltAxis.lengthSq() === 0) tiltAxis.set(1, 0, 0); // Default axis

                    // Combine initial rotation with tilt
                    const tiltQuaternion = new THREE.Quaternion().setFromAxisAngle(tiltAxis, currentTilt);
                    entity.mesh.quaternion.copy(entity.initialRotation).multiply(tiltQuaternion);

                    // Optional: Add a small shake effect here later if desired
                }
            }

            // Optional: Break if only one entity can be hit per attack
            break; // Let's only hit one tree per swing
        }
    }
}


// Start animation
animate();