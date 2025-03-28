import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a0a2a); // Dark purple background
scene.fog = new THREE.Fog(0x1a0a2a, 10, 80); // Add fog matching background, start 10, end 80

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10); // Position camera slightly above and behind the plane
camera.lookAt(0, 0, 0);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ground plane
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222, // Dark grey
    metalness: 0.6,
    roughness: 0.4,
    side: THREE.DoubleSide
});
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


// Airplane Model (Group of Meshes)
const airplaneGroup = new THREE.Group();
const fuselageGeometry = new THREE.BoxGeometry(0.6, 0.5, 3);
const wingGeometry = new THREE.BoxGeometry(3, 0.1, 0.8);
const tailFinGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.5);
const tailWingGeometry = new THREE.BoxGeometry(1, 0.1, 0.4);
const planeBodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x444455, // Dark blue-grey
    metalness: 0.8,
    roughness: 0.3
});
const planeEmissiveMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ffff, // Cyan
    emissive: 0x00ffff,
    emissiveIntensity: 1.5
});

// Fuselage
const fuselage = new THREE.Mesh(fuselageGeometry, planeBodyMaterial);
airplaneGroup.add(fuselage);

// Wings (centered on fuselage)
const wing = new THREE.Mesh(wingGeometry, planeBodyMaterial);
wing.position.y = 0; // Align vertically with fuselage center
wing.position.z = -0.3; // Position slightly back from the front
airplaneGroup.add(wing);

// Tail Fin (Vertical)
const tailFin = new THREE.Mesh(tailFinGeometry, planeBodyMaterial);
tailFin.position.y = 0.5; // Position on top rear of fuselage
tailFin.position.z = 1.2; // Position at the back
airplaneGroup.add(tailFin);

// Tail Wings (Horizontal)
const tailWing = new THREE.Mesh(tailWingGeometry, planeBodyMaterial);
tailWing.position.y = 0.1; // Position slightly above fuselage center at the back
tailWing.position.z = 1.3; // Position at the very back
airplaneGroup.add(tailWing);

// Add some emissive details to wings
const wingLightGeometry = new THREE.SphereGeometry(0.1);
const leftWingLight = new THREE.Mesh(wingLightGeometry, planeEmissiveMaterial);
leftWingLight.position.set(-1.4, 0.05, -0.3); // Tip of left wing
airplaneGroup.add(leftWingLight);
const rightWingLight = new THREE.Mesh(wingLightGeometry, planeEmissiveMaterial);
rightWingLight.position.set(1.4, 0.05, -0.3); // Tip of right wing
airplaneGroup.add(rightWingLight);

// Position the whole airplane group
airplaneGroup.position.set(0, 1, 0); // Start slightly above the ground
scene.add(airplaneGroup);


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
const speed = 0.3; // Increased speed
const turnSpeed = 0.05; // Increased turn speed
const climbSpeed = 0.2; // Further increased climb speed

// Keyboard controls
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w': case 'ArrowUp':    movement.forward = 1; break;
        case 's': case 'ArrowDown':  movement.forward = -1; break;
        case 'a': case 'ArrowLeft':  movement.turn = 1; break;
        case 'd': case 'ArrowRight': movement.turn = -1; break;
        case 'q':                    movement.climb = 1; break;
        case 'e':                    movement.climb = -1; break;
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

    // Update airplane rotation
    airplaneGroup.rotation.y += movement.turn * turnSpeed;
    // airplaneGroup.rotation.x += movement.climb * climbSpeed; // Simple pitch for now

    // Update airplane position based on its direction
    const direction = new THREE.Vector3();
    airplaneGroup.getWorldDirection(direction);
    // Negate movement.forward to align W/Up with forward movement
    airplaneGroup.position.addScaledVector(direction, -movement.forward * speed);

    // Update altitude
    airplaneGroup.position.y += movement.climb * climbSpeed;
    // Keep plane above ground
    if (airplaneGroup.position.y < 0) {
        airplaneGroup.position.y = 0;
    }

    // Update camera position to follow the plane
    const relativeCameraOffset = new THREE.Vector3(0, 3, 7); // Offset behind and slightly above
    const cameraOffset = relativeCameraOffset.applyMatrix4(airplaneGroup.matrixWorld);

    camera.position.lerp(cameraOffset, 0.1); // Smooth camera movement
    camera.lookAt(airplaneGroup.position); // Always look at the airplane

    renderer.render(scene, camera);
}

animate();