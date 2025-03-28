import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a0a2a); // Dark purple background
scene.fog = new THREE.Fog(0x1a0a2a, 10, 80); // Add fog matching background, start 10, end 80

// Camera setup (Fixed Overview)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 0); // High overhead view
camera.lookAt(0, 0, 0); // Centered on map

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Ground plane with boundary markers

const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0.6,
    roughness: 0.4,
    side: THREE.DoubleSide
});

// Add boundary edges
const edges = new THREE.EdgesGeometry(groundGeometry);
const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.5
});
const boundary = new THREE.LineSegments(edges, lineMaterial);
boundary.rotation.x = -Math.PI / 2;
boundary.position.y = -0.95;
scene.add(boundary);
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
ground.position.y = -1; // Position slightly below the origin
scene.add(ground);

// Add Cyber-Trees (Glowing Pillars)
const cyberTreePillarGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8); // Thin and tall
const cyberTreePillarMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 }); // Dark metallic
const cyberTreeLightGeometry = new THREE.SphereGeometry(0.3, 16, 8);
const cyberTreeLightMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ffff, // Cyan
    emissive: 0x00ffff, // Emissive cyan
    emissiveIntensity: 1
});

for (let i = 0; i < 25; i++) {
    const pillar = new THREE.Mesh(cyberTreePillarGeometry, cyberTreePillarMaterial);
    const light = new THREE.Mesh(cyberTreeLightGeometry, cyberTreeLightMaterial);

    const x = (Math.random() - 0.5) * 90;
    const z = (Math.random() - 0.5) * 90;

    pillar.position.set(x, 3 / 2 - 1, z); // Base on ground
    light.position.set(x, 3 - 1 + 0.1, z); // Light sits on top of pillar

    scene.add(pillar);
    scene.add(light);
}

// Load Cyberpunk Building Models
const gltfLoader = new GLTFLoader();
const buildingModelPaths = [
    './models/building1_extracted/scene.gltf',
    './models/building2_extracted/scene.gltf',
    './models/building3_extracted/scene.gltf'
];
const numBuildings = 15; // Total number of buildings to place

function loadModel(url) {
    return new Promise((resolve, reject) => {
        gltfLoader.load(url, resolve, undefined, reject);
    });
}

async function placeBuildings() {
    const loadedModels = await Promise.all(buildingModelPaths.map(loadModel));

    for (let i = 0; i < numBuildings; i++) {
        // Clone a random model from the loaded ones
        const originalGltf = loadedModels[i % loadedModels.length];
        const model = originalGltf.scene.clone(); // Clone the scene graph

        const x = (Math.random() - 0.5) * 90;
        const z = (Math.random() - 0.5) * 90;

        // --- Adjust scale and position ---
        // Models might have different origins and scales.
        // We'll apply a generic scale and position adjustment.
        // You might need to fine-tune this per model if they vary wildly.

        // Calculate bounding box to help with positioning and scaling
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Example scaling (adjust as needed)
        const desiredHeight = Math.random() * 15 + 10; // Random height between 10 and 25
        const scale = desiredHeight / size.y;
        model.scale.set(scale, scale, scale);

        // Recalculate box after scaling
        box.setFromObject(model);
        center.copy(box.getCenter(new THREE.Vector3())); // Update center after scaling

        // Position model so its bottom is near y = -1 (ground level)
        model.position.set(x, -box.min.y - 1, z);

        // Random rotation
        model.rotation.y = Math.random() * Math.PI * 2;

        scene.add(model);
    }
}

placeBuildings().catch(error => console.error("Error loading buildings:", error));

// Add Billboards with Stands and Different Textures
const billboardGeometry = new THREE.PlaneGeometry(6, 3); // Width, Height
const standGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 8); // radiusTop, radiusBottom, height, radialSegments
const standMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.9, roughness: 0.3 }); // Dark metallic stand
const textureLoader = new THREE.TextureLoader();

const billboardImageUrls = [
    'https://upload.wikimedia.org/wikipedia/commons/6/62/Cyberpunk_City.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e1/Dystopian_cyberpunk_city.png',
    'https://upload.wikimedia.org/wikipedia/commons/c/c7/595421639_megacity_advertising_people_crowds_flying_cars_cyberpunk_neon_light_tone_androids.png',
    'https://upload.wikimedia.org/wikipedia/commons/b/b3/Cyberpunk_city_with_not_enough_funds_to_protect_against_the_rising_sea%2C_using_the_polluted_water_for_cooler_air.jpg'
    // Add more URLs if needed
];

const billboardMaterials = billboardImageUrls.map(url => {
    const texture = textureLoader.load(url);
    return new THREE.MeshStandardMaterial({
        map: texture,
        color: 0xffffff,
        emissive: 0xaaaaaa,
        emissiveIntensity: 0.5,
        emissiveMap: texture,
        side: THREE.DoubleSide,
        toneMapped: false
    });
});

for (let i = 0; i < 8; i++) {
    const material = billboardMaterials[i % billboardMaterials.length]; // Cycle through materials
    const billboard = new THREE.Mesh(billboardGeometry, material);
    const stand = new THREE.Mesh(standGeometry, standMaterial);

    const x = (Math.random() - 0.5) * 85;
    const z = (Math.random() - 0.5) * 85;
    const billboardHeight = 3;
    const standBaseHeight = Math.random() * 10 + 5; // Stand base height 5m to 15m
    const billboardY = standBaseHeight + billboardHeight / 2; // Center billboard on top of stand

    billboard.position.set(x, billboardY, z);
    billboard.lookAt(new THREE.Vector3(0, billboardY, 0)); // Look towards center at its own height

    // Scale and position the stand
    stand.scale.y = standBaseHeight + 1; // Scale stand height (add 1 because base geometry height is 1)
    stand.position.set(x, (standBaseHeight + 1) / 2 - 1, z); // Position stand base on ground

    scene.add(billboard);
    scene.add(stand);
}

// Add Neon Lights (Ground Level)
const neonTubeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 4, 16); // Increased segments for smoothness
const neonPinkMaterial = new THREE.MeshStandardMaterial({
    color: 0xff1493, // DeepPink
    emissive: 0xff1493,
    emissiveIntensity: 1.8,
    toneMapped: false // Ensure emissive color isn't overly toned down
});
const neonGreenMaterial = new THREE.MeshStandardMaterial({
    color: 0x39FF14, // Neon Green
    emissive: 0x39FF14,
    emissiveIntensity: 1.8,
    toneMapped: false // Ensure emissive color isn't overly toned down
});

const neonMaterials = [neonPinkMaterial, neonGreenMaterial];

for (let i = 0; i < 20; i++) {
    const material = neonMaterials[Math.floor(Math.random() * neonMaterials.length)];
    const neonTube = new THREE.Mesh(neonTubeGeometry, material);
    const neonColor = material.emissive.getHex(); // Get the color for the point light

    const x = (Math.random() - 0.5) * 95;
    const z = (Math.random() - 0.5) * 95;
    const y = -0.8; // Slightly above ground plane

    neonTube.position.set(x, y, z);
    neonTube.rotation.y = Math.random() * Math.PI; // Random horizontal rotation
    neonTube.rotation.z = Math.PI / 2; // Lay flat

    scene.add(neonTube);

    // Add a point light for glow
    const pointLight = new THREE.PointLight(neonColor, 1, 5); // color, intensity, distance
    pointLight.position.set(x, y + 0.2, z); // Position slightly above the tube center
    scene.add(pointLight);
}


// Load TRON Commander-ship Model
const aircraftPath = './models/tron_ship_extracted/scene.gltf';
let aircraftModel = null;

// Load aircraft model with error handling
gltfLoader.load(aircraftPath, (gltf) => {
    try {
        aircraftModel = gltf.scene;
        
        // Scale the model appropriately
        const box = new THREE.Box3().setFromObject(aircraftModel);
        const size = box.getSize(new THREE.Vector3());
        const scale = 0.3; // Smaller scale for this model
        aircraftModel.scale.set(scale, scale, scale);
        
        // Position the model slightly above ground
        aircraftModel.position.set(0, 2, 0); // Higher starting position
        
        // Add spotlight to aircraft
        const spotlight = new THREE.SpotLight(0x00ffff, 5, 30, Math.PI/6, 0.5, 1);
        spotlight.position.set(0, -1, -1); // Position under and behind aircraft
        spotlight.target.position.set(0, -5, -5); // Point downward and forward
        aircraftModel.add(spotlight);
        aircraftModel.add(spotlight.target);
        
        // Add to scene
        scene.add(aircraftModel);
        
        // Initialize follow mode variables
        let followMode = false;
        let targetVehicle = null;
        
        // Load ground vehicles after aircraft is ready
        const vehiclePath = './models/ground_vehicle_extracted/scene.gltf';
        const vehicleCount = 5;
        const groundVehicles = [];
        const vehicleSpeed = 0.3; // Increased from 0.1 to 0.3
        
        gltfLoader.load(vehiclePath, (gltf) => {
            const vehicleModel = gltf.scene;
            
            for (let i = 0; i < vehicleCount; i++) {
                const vehicle = vehicleModel.clone();
                // Start vehicles in center area (60x60 instead of 80x80)
                vehicle.position.set(
                    (Math.random() - 0.5) * 60,
                    0,
                    (Math.random() - 0.5) * 60
                );
                vehicle.rotation.y = Math.random() * Math.PI * 2;
                // Scale up vehicles 5x
                vehicle.scale.set(2.5, 2.5, 2.5);
                scene.add(vehicle);
                groundVehicles.push(vehicle);
            }
            
            // Add vehicle movement to animation loop
            function animateVehicles() {
                const time = Date.now() * 0.001;
                
                groundVehicles.forEach((vehicle, index) => {
                    // Meandering behavior similar to aircraft autopilot
                    const vehicleTimeOffset = time + index * 5; // Offset pattern per vehicle
                    
                    // Gentle random turns
                    vehicle.rotation.y += (Math.sin(vehicleTimeOffset * 0.2) * 0.015);
                    
                    // Move forward with slight speed variations
                    const direction = new THREE.Vector3();
                    vehicle.getWorldDirection(direction);
                    const speedVariation = 1 + Math.sin(vehicleTimeOffset * 0.15) * 0.2;
                    vehicle.position.addScaledVector(direction, vehicleSpeed * speedVariation);
                    
                    // Enhanced boundary avoidance (35 unit boundary)
                    const boundary = 35;
                    const xDist = boundary - Math.abs(vehicle.position.x);
                    const zDist = boundary - Math.abs(vehicle.position.z);
                    
                    if (xDist < 5 || zDist < 5) {
                        const turnDirection = (xDist < zDist)
                            ? -Math.sign(vehicle.position.x)
                            : -Math.sign(vehicle.position.z);
                        vehicle.rotation.y += turnDirection * 0.1;
                        
                        // Slow down near boundaries
                        const slowFactor = Math.min(xDist, zDist)/5;
                        // Apply slowdown by reducing the added vector length
                        vehicle.position.addScaledVector(direction, vehicleSpeed * (slowFactor - speedVariation)); // Adjust speed based on slowFactor
                    }
                    
                    // Hard boundary limits
                    vehicle.position.x = THREE.MathUtils.clamp(vehicle.position.x, -boundary, boundary);
                    vehicle.position.z = THREE.MathUtils.clamp(vehicle.position.z, -boundary, boundary);
                });
            }
            
            // Modify existing animate function
            const originalAnimate = animate;
            animate = function() {
                originalAnimate();
                animateVehicles();
                
                // Follow mode logic
                if (followMode && targetVehicle) {
                    // Get target position with some randomness
                    const targetPos = new THREE.Vector3();
                    targetVehicle.getWorldPosition(targetPos);
                    
                    // Add some variation to following (5-15 units above, 5-15 units behind)
                    targetPos.y += 10 + Math.sin(Date.now() * 0.001) * 5;
                    targetPos.z += -10 + Math.cos(Date.now() * 0.0015) * 5;
                    
                    // More relaxed following
                    aircraftModel.position.lerp(targetPos, 0.02);
                    
                    // Face general direction with some variation
                    const direction = new THREE.Vector3();
                    targetVehicle.getWorldDirection(direction);
                    const targetYaw = Math.atan2(direction.x, direction.z);
                    aircraftModel.rotation.y += (targetYaw - aircraftModel.rotation.y) * 0.05;
                    
                    // Add slight banking when turning
                    const bankAmount = (targetYaw - aircraftModel.rotation.y) * 0.3;
                    aircraftModel.rotation.z = THREE.MathUtils.lerp(
                        aircraftModel.rotation.z,
                        bankAmount,
                        0.1
                    );
                }
            };
            
            // Add keybind to toggle follow mode (F key)
            document.addEventListener('keydown', (e) => {
                if (e.key === 'f' && groundVehicles.length > 0) {
                    followMode = !followMode;
                    if (followMode) {
                        // Pick random vehicle to follow
                        targetVehicle = groundVehicles[Math.floor(Math.random() * groundVehicles.length)];
                    }
                }
            });
            
        }, undefined, (error) => {
            console.error('Error loading ground vehicles:', error);
        });
        
    } catch (error) {
        console.error('Error initializing aircraft:', error);
        // Create simple placeholder if model fails to load
        aircraftModel = new THREE.Mesh(
            new THREE.BoxGeometry(2, 1, 4),
            new THREE.MeshStandardMaterial({color: 0x444455})
        );
        scene.add(aircraftModel);
    }
    
    // Fixed overhead camera setup
    camera.position.set(0, 50, 0); // High overhead view
    camera.lookAt(0, 0, 0); // Centered on map
    
    // Initialize OrbitControls for rotation and zoom
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
}, undefined, (error) => {
    console.error('Error loading airspeeder:', error);
});

// Lighting (Cyberpunk Style)
const ambientLight = new THREE.AmbientLight(0x4040ff, 0.2); // Dim blue ambient light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0x00ffff, 0.5); // Cyan directional light, less intense
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Airplane state
const movement = {
    forward: 0, // -1: backward, 0: still, 1: forward
    turn: 0,    // -1: left, 0: straight, 1: right
    climb: 0,   // -1: down, 0: level, 1: up
};
let autopilot = false;
const speed = 0.3;
const turnSpeed = 0.05;
const climbSpeed = 0.2;

// UI Elements
const controlsDisplay = document.getElementById('controls');
const autopilotDisplay = document.getElementById('autopilot');

function updateUI() {
    autopilotDisplay.textContent = `AUTOPILOT: ${autopilot ? 'ENGAGED' : 'STANDBY'}`;
    autopilotDisplay.style.color = autopilot ? '#00ff00' : '#ff00ff';
    autopilotDisplay.style.textShadow = autopilot ? '0 0 10px #00ff00' : '0 0 10px #ff00ff';
    autopilotDisplay.style.fontWeight = 'bold';
    autopilotDisplay.style.animation = autopilot ? 'pulse 1s infinite' : 'none';
}

// Keyboard controls
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w': case 'ArrowUp':    movement.forward = 1; break;
        case 's': case 'ArrowDown':  movement.forward = -1; break;
        case 'a': case 'ArrowLeft':  movement.turn = 1; break;
        case 'd': case 'ArrowRight': movement.turn = -1; break;
        case 'q':                    movement.climb = 1; break;
        case 'e':                    movement.climb = -1; break;
        case 'p': case 'P':          autopilot = !autopilot; updateUI(); break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'w': case 'ArrowUp':
        case 's': case 'ArrowDown':  movement.forward = 0; break;
        case 'a': case 'ArrowLeft':
        case 'd': case 'ArrowRight': movement.turn = 0; break;
        case 'q':
        case 'e':                    movement.climb = 0; break;
    }
});


// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (aircraftModel) {
        if (autopilot) {
            // Meandering autopilot behavior
            const time = Date.now() * 0.001;
            
            // Gentle random turns and altitude changes
            aircraftModel.rotation.y += (Math.sin(time * 0.3) * 0.02);
            aircraftModel.position.y = 15 + Math.sin(time * 0.5) * 3;
            aircraftModel.rotation.z = Math.sin(time * 0.4) * 0.3;
            
            // Move forward with slight speed variations
            const direction = new THREE.Vector3();
            aircraftModel.getWorldDirection(direction);
            const speedVariation = 1 + Math.sin(time * 0.2) * 0.3;
            aircraftModel.position.addScaledVector(direction, speed * 1.2 * speedVariation);
            
            // Proactive boundary avoidance
            const boundaryMargin = 40; // Start turning 5 units before boundary
            const turnIntensity = 0.15; // More aggressive turn when near edge
            
            // Calculate distance to nearest boundary
            const xDist = boundaryMargin - Math.abs(aircraftModel.position.x);
            const zDist = boundaryMargin - Math.abs(aircraftModel.position.z);
            
            if (xDist < 5 || zDist < 5) {
                // Determine turn direction (away from nearest boundary)
                const turnDirection = (xDist < zDist)
                    ? -Math.sign(aircraftModel.position.x)
                    : -Math.sign(aircraftModel.position.z);
                    
                // Apply turn with intensity based on proximity to boundary
                const turnAmount = turnIntensity * (1 - Math.min(xDist, zDist)/5);
                aircraftModel.rotation.y += turnDirection * turnAmount;
                
                // Reduce speed near boundaries
                const speedFactor = 0.5 + (Math.min(xDist, zDist)/10);
                aircraftModel.position.addScaledVector(direction, speed * speedFactor);
            }
        } else {
            // Manual control
            aircraftModel.rotation.z += movement.turn * turnSpeed;
            aircraftModel.position.y += movement.climb * climbSpeed;
            
            const direction = new THREE.Vector3();
            aircraftModel.getWorldDirection(direction);
            aircraftModel.position.addScaledVector(direction, movement.forward * speed);

            if (aircraftModel.position.y < 0) {
                aircraftModel.position.y = 0;
            }
        }
    }

    // Only auto-position camera if controls aren't enabled
    if (aircraftModel && !controls.enabled) {
        const cameraOffset = new THREE.Vector3(0, 5, -25);
        // Camera position remains fixed (commented out following code)
        // cameraOffset.applyMatrix4(aircraftModel.matrixWorld);
        // camera.position.copy(cameraOffset);
        
        // Camera remains fixed looking at center (commented out aircraft tracking)
        // const lookAtPoint = new THREE.Vector3(0, 0, 0);
        // lookAtPoint.applyMatrix4(aircraftModel.matrixWorld);
        // camera.lookAt(lookAtPoint);
    }
    
    // Always update controls if enabled
    if (aircraftModel && controls.enabled) {
        controls.target.copy(aircraftModel.position);
        controls.update();
    }
    
    renderer.render(scene, camera);
}

// Initialize UI
updateUI();

animate();