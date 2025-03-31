import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Global variables
const loader = new GLTFLoader();
let pedestrianAvatar;
let controls;
const avatarSpeed = 0.2;
const cameraFollowOffset = new THREE.Vector3(0, 0, 5);
let avatarMixer = null;
let walkAction = null; // Store the animation action
const clock = new THREE.Clock();

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a0a2a);
scene.fog = new THREE.Fog(0x1a0a2a, 10, 80);

// Lighting setup
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xcc00ff, 0.5, 50);
pointLight.position.set(0, 5, 0);
scene.add(pointLight);

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.copy(cameraFollowOffset);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ground plane
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0.6,
    roughness: 0.4,
    side: THREE.DoubleSide
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1;
scene.add(ground);

// Load buildings
const buildingModelPaths = [
    './models/building1_extracted/scene.gltf',
    './models/building2_extracted/scene.gltf',
    './models/building3_extracted/scene.gltf'
];

async function loadBuildings() {
    //     const loadedModels = await Promise.all(
    //         buildingModelPaths.map(url => new Promise((resolve, reject) => {
    //             loader.load(url, resolve, undefined, reject);
    //         }))
    //     );

    //     for (let i = 0; i < 15; i++) {
    //         const model = loadedModels[i % loadedModels.length].scene.clone();
    //         const x = (Math.random() - 0.5) * 90;
    //         const z = (Math.random() - 0.5) * 90;
    //         model.position.set(x, 0, z);
    //         model.rotation.y = Math.random() * Math.PI * 2;
    //         scene.add(model);
    //     }

}

// Load avatar
loader.load('models/walking.glb', (gltf) => {
    try {
        pedestrianAvatar = gltf.scene;
        pedestrianAvatar.position.set(0, 0, 0);
        pedestrianAvatar.scale.set(1.0, 1.0, 1.0);
        scene.add(pedestrianAvatar);

        if (gltf.animations?.length) {
            avatarMixer = new THREE.AnimationMixer(pedestrianAvatar);
            walkAction = avatarMixer.clipAction(gltf.animations[0]); // Store the action
            walkAction.play();
            walkAction.timeScale = 0; // Freeze animation on first frame
        }
    } catch (error) {
        console.error('Error loading avatar:', error);
    }
});




// Orbit controls with follow behavior
controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.0, 0); // Initial target, will be updated
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 5;
controls.maxDistance = 5;
controls.minPolarAngle = Math.PI / 4; // Prevent looking straight down/up
controls.maxPolarAngle = Math.PI / 2; // Keep horizon-level view
camera.position.set(0, 1.5, -5); // Start behind avatar
controls.update(); // Initial update

// Avatar movement
const keys = {
    w: false, a: false, s: false, d: false
};

window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key.toLowerCase())) {
        keys[e.key.toLowerCase()] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key.toLowerCase())) {
        keys[e.key.toLowerCase()] = false;
    }
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    // Update avatar
    if (pedestrianAvatar) {
        const isMoving = keys.w || keys.s || keys.a || keys.d;

        if (isMoving) {
            if (walkAction) {
                walkAction.timeScale = 1; // Play animation
            }
            if (keys.w || keys.s) {
                const direction = new THREE.Vector3(0, 0, keys.w ? 1 : -1);
                direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), pedestrianAvatar.rotation.y);
                pedestrianAvatar.position.addScaledVector(direction, avatarSpeed);
            }
            if (keys.a) pedestrianAvatar.rotation.y += avatarSpeed * .2;
            if (keys.d) pedestrianAvatar.rotation.y -= avatarSpeed * .2;
        } else if (walkAction) {
            walkAction.timeScale = 0; // Freeze animation
        }

        // Update controls target to follow avatar
        const targetPosition = pedestrianAvatar.position.clone().add(new THREE.Vector3(0, 1.0, 0)); // Target slightly above feet
        controls.target.lerp(targetPosition, 0.1); // Smoothly interpolate target
        camera.lookAt(pedestrianAvatar.position);

    }

    // Update animation mixer
    if (avatarMixer) {
        avatarMixer.update(delta);
    }

    renderer.render(scene, camera);
}

// Initialize
loadBuildings();
animate();