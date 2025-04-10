// Import Three.js and OrbitControls
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Game settings
const gravity = 0.5;
const jumpForce = 15; // Initial jump velocity
const doubleJumpForce = 12; // Slightly weaker second jump
const jumpCooldown = 200; // Milliseconds between jumps
const jumpHoldTime = 180; // Max milliseconds to hold jump for variable height
const maxJumps = 2; // Maximum number of jumps (1 = normal jump, 2 = double jump)
const doubleJumpEffectDuration = 300; // How long the double jump effect lasts (ms)

// Performance settings
let highPerformanceMode = false; // Toggle for high performance mode
let psychedelicMode = true;
let effectsQuality = highPerformanceMode ? 'low' : 'high'; // 'low', 'medium', 'high'
let maxParticles = highPerformanceMode ? 10 : 30;
let textureUpdateFrequency = highPerformanceMode ? 10 : 1; // Update every N frames
let textureResolution = highPerformanceMode ? 256 : 512; // Texture resolution

// Visual settings
const colorCycle = ['#FF00FF', '#00FFFF', '#FFFF00', '#FF0000', '#00FF00', '#0000FF'];
let colorIndex = 0;
let backgroundHue = 0;
let lastJumpTime = 0; // Track when the last jump occurred
let jumpKeyPressed = false; // Track if jump key is being held
let jumpStartTime = 0; // When the jump started
let doubleJumpEffect = false; // Track if double jump effect should be shown
let doubleJumpEffectTime = 0; // When the double jump effect started

// Performance monitoring
let frameCount = 0;
let lastTime = 0;
let fps = 0;

// Three.js variables
let scene, camera, renderer, controls;
let player, floor, skybox;
let trailParticles = [];
let doubleJumpParticles = [];
let acidWalls = [];
let wallPatterns = [];
let pulseTime = 0;
let worldSize = { width: 1000, height: 600, depth: 1000 };
let frameCounter = 0; // Counter for throttling texture updates
let orbitEnabled = false; // Toggle for orbit camera

// Player state
let playerState = {
    velocity: { x: 0, y: 0, z: 0 },
    isGrounded: false,
    isJumping: false,
    jumpCount: 0
};

// Initialize the 3D scene
function init() {
    // Create scene
    scene = new THREE.Scene();

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 200, 500);
    camera.lookAt(0, 100, 0);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: !highPerformanceMode });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    renderer.shadowMap.enabled = !highPerformanceMode;
    if (renderer.shadowMap.enabled) {
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows, better performance than default
    }
    document.getElementById('gameContainer').appendChild(renderer.domElement);

    // Create orbit controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Add smooth damping effect
    controls.dampingFactor = 0.05;
    controls.minDistance = 100; // Minimum zoom distance
    controls.maxDistance = 1000; // Maximum zoom distance
    controls.maxPolarAngle = Math.PI / 2; // Prevent going below ground
    controls.target.set(0, 100, 0); // Set initial target to player's position
    controls.enabled = orbitEnabled; // Initially disabled

    // Add FPS counter
    const fpsCounter = document.createElement('div');
    fpsCounter.id = 'fpsCounter';
    fpsCounter.style.position = 'absolute';
    fpsCounter.style.top = '10px';
    fpsCounter.style.left = '10px';
    fpsCounter.style.color = 'white';
    fpsCounter.style.fontFamily = 'monospace';
    fpsCounter.style.fontSize = '16px';
    fpsCounter.style.zIndex = '100';
    document.getElementById('gameContainer').appendChild(fpsCounter);

    // Add performance toggle button
    const perfButton = document.createElement('button');
    perfButton.id = 'perfToggle';
    perfButton.textContent = highPerformanceMode ? 'Enable Effects' : 'Performance Mode';
    perfButton.style.position = 'absolute';
    perfButton.style.top = '10px';
    perfButton.style.right = '10px';
    perfButton.style.padding = '5px 10px';
    perfButton.style.zIndex = '100';
    perfButton.addEventListener('click', togglePerformanceMode);

    // Prevent spacebar from activating the button
    perfButton.addEventListener('keydown', (event) => {
        if (event.key === ' ') {
            event.preventDefault();
        }
    });

    document.getElementById('gameContainer').appendChild(perfButton);

    // Add performance info text
    const perfInfo = document.createElement('div');
    perfInfo.id = 'perfInfo';
    perfInfo.textContent = 'Press P to toggle performance mode';
    perfInfo.style.position = 'absolute';
    perfInfo.style.top = '40px';
    perfInfo.style.right = '10px';
    perfInfo.style.color = 'white';
    perfInfo.style.fontFamily = 'monospace';
    perfInfo.style.fontSize = '12px';
    perfInfo.style.zIndex = '100';
    document.getElementById('gameContainer').appendChild(perfInfo);

    // Add orbit camera toggle button
    const orbitButton = document.createElement('button');
    orbitButton.id = 'orbitToggle';
    orbitButton.textContent = 'Enable Orbit Camera';
    orbitButton.style.position = 'absolute';
    orbitButton.style.top = '10px';
    orbitButton.style.right = '150px';
    orbitButton.style.padding = '5px 10px';
    orbitButton.style.zIndex = '100';
    orbitButton.addEventListener('click', toggleOrbitCamera);
    document.getElementById('gameContainer').appendChild(orbitButton);

    // Add orbit camera info text
    const orbitInfo = document.createElement('div');
    orbitInfo.id = 'orbitInfo';
    orbitInfo.textContent = 'Press O to toggle orbit camera | Mouse: Rotate | Scroll: Zoom';
    orbitInfo.style.position = 'absolute';
    orbitInfo.style.top = '70px';
    orbitInfo.style.right = '10px';
    orbitInfo.style.color = 'white';
    orbitInfo.style.fontFamily = 'monospace';
    orbitInfo.style.fontSize = '12px';
    orbitInfo.style.zIndex = '100';
    document.getElementById('gameContainer').appendChild(orbitInfo);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(100, 300, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Create floor
    const floorGeometry = new THREE.PlaneGeometry(worldSize.width, worldSize.depth);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.7,
        metalness: 0.1
    });
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Create player (cube)
    const playerGeometry = new THREE.BoxGeometry(50, 50, 50);
    const playerMaterial = new THREE.MeshPhongMaterial({ color: 0xff00ff });
    player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.set(0, 25, 0); // Start above the floor
    player.castShadow = true;
    player.receiveShadow = true;
    scene.add(player);

    // Create skybox with psychedelic patterns
    const skyboxGeometry = new THREE.BoxGeometry(1500, 1500, 1500);
    const skyboxMaterials = [];
    for (let i = 0; i < 6; i++) {
        // Create canvas for texture
        const canvas = document.createElement('canvas');
        canvas.width = textureResolution;
        canvas.height = textureResolution;
        const ctx = canvas.getContext('2d');

        // Create a pattern for this face
        const pattern = {
            canvas: canvas,
            ctx: ctx,
            hueOffset: i * 60,
            gridSize: 8 + i * 2,
            pulseSpeed: 0.5 + i * 0.2,
            pulseIntensity: 0.3 + i * 0.1
        };
        wallPatterns.push(pattern);

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);

        skyboxMaterials.push(new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide
        }));
    }
    skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
    scene.add(skybox);

    // Create acid walls
    createAcidWalls();

    // Add some 3D obstacles/platforms
    createObstacles();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Set up keyboard controls
    setupControls();

    // Start the game loop
    animate();
}

// Create acid walls with pulsing patterns
function createAcidWalls() {
    // Create walls at the boundaries of the world
    const wallHeight = 400;
    const wallThickness = 20;
    const halfWidth = worldSize.width / 2;
    const halfDepth = worldSize.depth / 2;

    // Create wall geometries
    const sideWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, worldSize.depth);
    const frontWallGeometry = new THREE.BoxGeometry(worldSize.width, wallHeight, wallThickness);

    // Create wall materials with canvas textures for each wall
    for (let i = 0; i < 4; i++) {
        // Create canvas for texture
        const canvas = document.createElement('canvas');
        canvas.width = textureResolution;
        canvas.height = textureResolution;
        const ctx = canvas.getContext('2d');

        // Create a pattern for this wall
        const pattern = {
            canvas: canvas,
            ctx: ctx,
            hueOffset: i * 90,
            gridSize: 12 - i * 2,
            pulseSpeed: 0.8 + i * 0.3,
            pulseIntensity: 0.5 + i * 0.1,
            waveFrequency: 5 + i * 2,
            waveAmplitude: 20 + i * 10
        };
        wallPatterns.push(pattern);

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 4);

        const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            opacity: 0.8,
            emissive: new THREE.Color(1, 1, 1),
            emissiveIntensity: 0.5
        });

        let wall;

        // Position walls based on index
        if (i === 0) { // Left wall
            wall = new THREE.Mesh(sideWallGeometry, material);
            wall.position.set(-halfWidth - wallThickness/2, wallHeight/2, 0);
        } else if (i === 1) { // Right wall
            wall = new THREE.Mesh(sideWallGeometry, material);
            wall.position.set(halfWidth + wallThickness/2, wallHeight/2, 0);
        } else if (i === 2) { // Front wall
            wall = new THREE.Mesh(frontWallGeometry, material);
            wall.position.set(0, wallHeight/2, -halfDepth - wallThickness/2);
        } else { // Back wall
            wall = new THREE.Mesh(frontWallGeometry, material);
            wall.position.set(0, wallHeight/2, halfDepth + wallThickness/2);
        }

        wall.userData = { patternIndex: wallPatterns.length - 1 };
        scene.add(wall);
        acidWalls.push(wall);
    }
}

// Update wall patterns
function updateWallPatterns() {
    pulseTime += 0.016; // Approximately 60fps

    // Only update textures periodically based on performance settings
    frameCounter++;
    if (frameCounter % textureUpdateFrequency !== 0) return;

    // Update each pattern
    wallPatterns.forEach((pattern, index) => {
        const { canvas, ctx, hueOffset, gridSize, pulseSpeed, pulseIntensity, waveFrequency, waveAmplitude } = pattern;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate pulse value
        const pulse = Math.sin(pulseTime * pulseSpeed) * pulseIntensity + 0.5;

        // Draw grid pattern
        const cellSize = canvas.width / gridSize;

        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                // Calculate position with wave effect - ensure values are finite
                let waveOffsetX = Math.sin((y / gridSize) * Math.PI * waveFrequency + pulseTime) * waveAmplitude;
                let waveOffsetY = Math.cos((x / gridSize) * Math.PI * waveFrequency + pulseTime) * waveAmplitude;

                // Ensure values are finite
                waveOffsetX = Number.isFinite(waveOffsetX) ? waveOffsetX : 0;
                waveOffsetY = Number.isFinite(waveOffsetY) ? waveOffsetY : 0;

                const waveX = x * cellSize + waveOffsetX;
                const waveY = y * cellSize + waveOffsetY;

                // Calculate color based on position and time
                const hue = (hueOffset + (x + y) * 30 + pulseTime * 20) % 360;
                const saturation = 80 + Math.sin(pulseTime * 2 + x * y) * 20;
                const lightness = 50 + pulse * 30;

                // Draw cell
                ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                ctx.beginPath();

                if (index % 3 === 0) {
                    // Circles
                    ctx.arc(waveX + cellSize/2, waveY + cellSize/2, cellSize/2 * (0.5 + pulse * 0.5), 0, Math.PI * 2);
                } else if (index % 3 === 1) {
                    // Squares
                    const size = cellSize * (0.5 + pulse * 0.5);
                    ctx.rect(waveX + (cellSize - size)/2, waveY + (cellSize - size)/2, size, size);
                } else {
                    // Triangles
                    const size = cellSize * (0.5 + pulse * 0.5);
                    ctx.moveTo(waveX + cellSize/2, waveY + (cellSize - size)/2);
                    ctx.lineTo(waveX + (cellSize - size)/2, waveY + (cellSize + size)/2);
                    ctx.lineTo(waveX + (cellSize + size)/2, waveY + (cellSize + size)/2);
                }

                ctx.fill();

                // Add glow effect - with safety checks
                try {
                    // Ensure all coordinates are valid numbers
                    const centerX = waveX + cellSize/2;
                    const centerY = waveY + cellSize/2;
                    const radius = cellSize;

                    // Only create gradient if all values are valid
                    if (Number.isFinite(centerX) && Number.isFinite(centerY) && Number.isFinite(radius) && radius > 0) {
                        const glow = ctx.createRadialGradient(
                            centerX, centerY, 0,
                            centerX, centerY, radius
                        );
                        glow.addColorStop(0, `hsla(${(hue + 30) % 360}, 100%, 70%, ${0.3 * pulse})`);
                        glow.addColorStop(1, `hsla(${(hue + 30) % 360}, 100%, 50%, 0)`);
                        ctx.fillStyle = glow;
                    } else {
                        // Fallback to solid color if gradient can't be created
                        ctx.fillStyle = `hsla(${(hue + 30) % 360}, 100%, 70%, 0.3)`;
                    }
                } catch (e) {
                    // Fallback in case of any error
                    ctx.fillStyle = `hsla(${(hue + 30) % 360}, 100%, 70%, 0.3)`;
                }

                // fillRect is already handled inside the try-catch block with the appropriate fillStyle
                ctx.fillRect(waveX, waveY, cellSize, cellSize);
            }
        }

        // Update texture
        if (index < 6) {
            skybox.material[index].map.needsUpdate = true;
        } else {
            const wallIndex = index - 6;
            if (wallIndex < acidWalls.length) {
                acidWalls[wallIndex].material.map.needsUpdate = true;

                // Animate wall opacity for extra effect
                acidWalls[wallIndex].material.opacity = 0.6 + Math.sin(pulseTime * 2) * 0.2;

                // Animate emissive intensity
                acidWalls[wallIndex].material.emissiveIntensity = 0.3 + pulse * 0.7;
            }
        }
    });
}

// Create some obstacles and platforms in the 3D world
function createObstacles() {
    // Create some floating platforms
    const platformGeometry = new THREE.BoxGeometry(200, 20, 200);
    const platformMaterial = new THREE.MeshPhongMaterial({ color: 0x00aaff });

    // Platform 1
    const platform1 = new THREE.Mesh(platformGeometry, platformMaterial);
    platform1.position.set(300, 100, -100);
    platform1.castShadow = true;
    platform1.receiveShadow = true;
    scene.add(platform1);

    // Platform 2
    const platform2 = new THREE.Mesh(platformGeometry, platformMaterial);
    platform2.position.set(-300, 150, 100);
    platform2.castShadow = true;
    platform2.receiveShadow = true;
    scene.add(platform2);

    // Platform 3 (higher)
    const platform3 = new THREE.Mesh(platformGeometry, platformMaterial);
    platform3.position.set(0, 250, -300);
    platform3.castShadow = true;
    platform3.receiveShadow = true;
    scene.add(platform3);

    // Add some decorative elements
    for (let i = 0; i < 20; i++) {
        const size = Math.random() * 30 + 10;
        const cubeGeometry = new THREE.BoxGeometry(size, size, size);
        const cubeMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(Math.random(), Math.random(), Math.random())
        });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

        // Random position within world bounds
        cube.position.set(
            (Math.random() - 0.5) * worldSize.width,
            size/2 + Math.random() * 100,
            (Math.random() - 0.5) * worldSize.depth
        );

        cube.castShadow = true;
        cube.receiveShadow = true;
        scene.add(cube);
    }
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Set up keyboard controls
function setupControls() {
    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'ArrowLeft':
            case 'a':
                playerState.velocity.x = -10;
                break;
            case 'ArrowRight':
            case 'd':
                playerState.velocity.x = 10;
                break;
            case 'ArrowUp':
            case 'w':
                playerState.velocity.z = -10; // Forward in 3D space
                break;
            case 'ArrowDown':
            case 's':
                playerState.velocity.z = 10; // Backward in 3D space
                break;
            case 'p': // P key for performance mode toggle
                togglePerformanceMode();
                break;
            case 'o': // O key for orbit camera toggle
                toggleOrbitCamera();
                break;
            case ' ': // Space bar for jumping
                jumpKeyPressed = true;

                // Handle jumping with cooldown
                {
                    const currentTime = Date.now();
                    if (currentTime - lastJumpTime > jumpCooldown) {
                        // First jump when grounded
                        if (playerState.isGrounded) {
                            playerState.velocity.y = jumpForce;
                            playerState.isGrounded = false;
                            playerState.isJumping = true;
                            playerState.jumpCount = 1;
                            lastJumpTime = currentTime;
                            jumpStartTime = currentTime;
                        }
                        // Double jump when in the air and haven't used all jumps
                        else if (playerState.jumpCount < maxJumps) {
                            playerState.velocity.y = doubleJumpForce;
                            playerState.jumpCount++;
                            lastJumpTime = currentTime;
                            doubleJumpEffect = true;
                            doubleJumpEffectTime = currentTime;
                            createDoubleJumpEffect();

                            // Add a slight boost to horizontal movement for more dynamic double jumps
                            if (playerState.velocity.x !== 0) {
                                playerState.velocity.x *= 1.2;
                            }
                            if (playerState.velocity.z !== 0) {
                                playerState.velocity.z *= 1.2;
                            }
                        }
                    }
                }
                break;
        }
    });

    document.addEventListener('keyup', (event) => {
        switch (event.key) {
            case 'ArrowLeft':
            case 'a':
            case 'ArrowRight':
            case 'd':
                playerState.velocity.x = 0;
                break;
            case 'ArrowUp':
            case 'w':
            case 'ArrowDown':
            case 's':
                playerState.velocity.z = 0;
                break;
            case ' ':
                jumpKeyPressed = false;
                break;
        }
    });
}

// Create double jump effect (particles)
function createDoubleJumpEffect() {
    // Adjust particle count based on performance mode
    const particleCount = highPerformanceMode ? 8 : 20;
    const particleGeometry = new THREE.SphereGeometry(3, highPerformanceMode ? 4 : 8, highPerformanceMode ? 4 : 8);

    for (let i = 0; i < particleCount; i++) {
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? 0xffffff : 0xff00ff,
            transparent: true,
            opacity: 0.8
        });

        const particle = new THREE.Mesh(particleGeometry, particleMaterial);

        // Position around the player
        const angle = (i / particleCount) * Math.PI * 2;
        const radius = 30;
        particle.position.set(
            player.position.x + Math.cos(angle) * radius,
            player.position.y,
            player.position.z + Math.sin(angle) * radius
        );

        // Add velocity for animation
        particle.userData = {
            velocity: {
                x: Math.cos(angle) * 2,
                y: Math.random() * 2 + 2,
                z: Math.sin(angle) * 2
            },
            creationTime: Date.now()
        };

        scene.add(particle);
        doubleJumpParticles.push(particle);
    }
}

// Create trail effect
function createTrailParticle() {
    if (!psychedelicMode) return;

    // Skip particle creation if we're at the limit
    if (trailParticles.length >= maxParticles) {
        const oldestParticle = trailParticles.shift();
        scene.remove(oldestParticle);
    }

    const particleGeometry = new THREE.SphereGeometry(5, highPerformanceMode ? 4 : 8, highPerformanceMode ? 4 : 8);
    const particleMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colorCycle[Math.floor(colorIndex)]),
        transparent: true,
        opacity: 0.7
    });

    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    particle.position.copy(player.position);
    particle.userData = {
        creationTime: Date.now(),
        lifetime: highPerformanceMode ? 500 : 1000 // Shorter lifetime in performance mode
    };

    scene.add(particle);
    trailParticles.push(particle);
}

// Update game state
function update() {
    // Apply gravity
    playerState.velocity.y -= gravity;

    // Apply air resistance
    if (!playerState.isGrounded) {
        playerState.velocity.x *= 0.98;
        playerState.velocity.z *= 0.98;
    }

    // Update player position
    player.position.x += playerState.velocity.x;
    player.position.y += playerState.velocity.y;
    player.position.z += playerState.velocity.z;

    // Reset grounded state before checking
    playerState.isGrounded = false;

    // Handle variable jump height if player releases jump key early
    if (playerState.isJumping && !jumpKeyPressed) {
        const jumpHoldDuration = Date.now() - jumpStartTime;
        if (jumpHoldDuration < jumpHoldTime && playerState.velocity.y > 2) {
            // Cut the jump short by reducing upward velocity
            playerState.velocity.y *= 0.85;
        }
    }

    // Handle double jump effect timing
    if (doubleJumpEffect) {
        const effectDuration = Date.now() - doubleJumpEffectTime;
        if (effectDuration > doubleJumpEffectDuration) {
            doubleJumpEffect = false;
        }
    }

    // Update double jump particles
    for (let i = doubleJumpParticles.length - 1; i >= 0; i--) {
        const particle = doubleJumpParticles[i];
        const age = Date.now() - particle.userData.creationTime;

        // Move particle
        particle.position.x += particle.userData.velocity.x;
        particle.position.y += particle.userData.velocity.y;
        particle.position.z += particle.userData.velocity.z;

        // Fade out and slow down
        particle.userData.velocity.y -= 0.1;
        particle.material.opacity = 0.8 * (1 - age / doubleJumpEffectDuration);

        // Remove old particles
        if (age > doubleJumpEffectDuration) {
            scene.remove(particle);
            doubleJumpParticles.splice(i, 1);
        }
    }

    // Update trail particles
    for (let i = trailParticles.length - 1; i >= 0; i--) {
        const particle = trailParticles[i];
        const age = Date.now() - particle.userData.creationTime;

        // Fade out
        particle.material.opacity = 0.7 * (1 - age / particle.userData.lifetime);

        // Remove old particles
        if (age > particle.userData.lifetime) {
            scene.remove(particle);
            trailParticles.splice(i, 1);
        }
    }

    // Trippy effects
    if (psychedelicMode) {
        // Throttle color cycling based on performance mode
        colorIndex = (colorIndex + (highPerformanceMode ? 0.01 : 0.03)) % colorCycle.length;
        player.material.color.set(colorCycle[Math.floor(colorIndex)]);
        backgroundHue = (backgroundHue + (highPerformanceMode ? 0.5 : 1)) % 360;

        // Rotate player (reduced in performance mode)
        if (!highPerformanceMode) {
            player.rotation.y += 0.05;
            player.rotation.x += 0.01;
        } else {
            // Less frequent rotation in performance mode
            if (frameCounter % 3 === 0) {
                player.rotation.y += 0.05;
            }
        }

        // Create trail particles occasionally (less frequently in performance mode)
        if (Math.random() > (highPerformanceMode ? 0.9 : 0.7)) {
            createTrailParticle();
        }

        // Update acid wall patterns
        updateWallPatterns();
    }

    // World boundaries
    const halfWidth = worldSize.width / 2;
    const halfDepth = worldSize.depth / 2;

    if (player.position.x < -halfWidth) {
        player.position.x = -halfWidth;
        playerState.velocity.x = -playerState.velocity.x * 0.9;
    } else if (player.position.x > halfWidth) {
        player.position.x = halfWidth;
        playerState.velocity.x = -playerState.velocity.x * 0.9;
    }

    if (player.position.z < -halfDepth) {
        player.position.z = -halfDepth;
        playerState.velocity.z = -playerState.velocity.z * 0.9;
    } else if (player.position.z > halfDepth) {
        player.position.z = halfDepth;
        playerState.velocity.z = -playerState.velocity.z * 0.9;
    }

    // Floor collision
    if (player.position.y < 25) { // 25 is half the player height
        player.position.y = 25;
        playerState.velocity.y = 0;
        playerState.isGrounded = true;
        playerState.isJumping = false;
        playerState.jumpCount = 0;
        doubleJumpEffect = false;
    }

    // Camera handling
    if (orbitEnabled) {
        // Update orbit controls target to follow player
        controls.target.set(player.position.x, player.position.y, player.position.z);
        controls.update(); // Required when damping is enabled
    } else {
        // Standard camera follow
        camera.position.x = player.position.x;
        camera.position.z = player.position.z + 500;
        camera.lookAt(player.position);
    }
}

// Toggle performance mode
function togglePerformanceMode() {
    highPerformanceMode = !highPerformanceMode;

    // Update settings
    effectsQuality = highPerformanceMode ? 'low' : 'high';
    maxParticles = highPerformanceMode ? 10 : 30;
    textureUpdateFrequency = highPerformanceMode ? 10 : 1;
    textureResolution = highPerformanceMode ? 256 : 512;

    // Update renderer settings
    renderer.shadowMap.enabled = !highPerformanceMode;

    // Update button text
    const perfButton = document.getElementById('perfToggle');
    if (perfButton) {
        perfButton.textContent = highPerformanceMode ? 'Enable Effects' : 'Performance Mode';
    }

    // Clear excess particles
    while (trailParticles.length > maxParticles) {
        const oldestParticle = trailParticles.shift();
        scene.remove(oldestParticle);
    }
}

// Toggle orbit camera
function toggleOrbitCamera() {
    orbitEnabled = !orbitEnabled;
    controls.enabled = orbitEnabled;

    // Update button text
    const orbitButton = document.getElementById('orbitToggle');
    if (orbitButton) {
        orbitButton.textContent = orbitEnabled ? 'Disable Orbit Camera' : 'Enable Orbit Camera';
    }
}

// Calculate and update FPS
function updateFPS() {
    frameCount++;
    const now = performance.now();
    const elapsed = now - lastTime;

    if (elapsed >= 1000) { // Update every second
        fps = Math.round((frameCount * 1000) / elapsed);
        frameCount = 0;
        lastTime = now;

        // Update FPS counter
        const fpsCounter = document.getElementById('fpsCounter');
        if (fpsCounter) {
            fpsCounter.textContent = `FPS: ${fps}`;
        }
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    update();

    // Update orbit controls if enabled
    if (orbitEnabled) {
        controls.update();
    }

    renderer.render(scene, camera);
    updateFPS();
}

// Initialize the game
init();
