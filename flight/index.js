import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Global variables
const loader = new GLTFLoader();
let pedestrianAvatar;
let controls;
const avatarSpeed = 0.05;
const cameraFollowOffset = new THREE.Vector3(0, 4, 8);
let avatarMixer = null;
const clock = new THREE.Clock();

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a0a2a);
scene.fog = new THREE.Fog(0x1a0a2a, 10, 80);

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
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
    try {
        const loadedModels = await Promise.all(
            buildingModelPaths.map(url => new Promise((resolve, reject) => {
                loader.load(url, resolve, undefined, reject);
            }))
        );

        for (let i = 0; i < 15; i++) {
            const model = loadedModels[i % loadedModels.length].scene.clone();
            const x = (Math.random() - 0.5) * 90;
            const z = (Math.random() - 0.5) * 90;
            model.position.set(x, 0, z);
            model.rotation.y = Math.random() * Math.PI * 2;
            scene.add(model);
        }
    } catch (error) {
        console.error('Error loading buildings:', error);
    }
}

// Load avatar
loader.load('models/walking.glb', (gltf) => {
    try {
        pedestrianAvatar = gltf.scene;
        pedestrianAvatar.position.set(0, 0, 0);
        pedestrianAvatar.scale.set(1.5, 1.5, 1.5);
        scene.add(pedestrianAvatar);

        if (gltf.animations?.length) {
            avatarMixer = new THREE.AnimationMixer(pedestrianAvatar);
            const action = avatarMixer.clipAction(gltf.animations[0]);
            action.play();
            action.timeScale = 0; // Freeze animation on first frame
        }
    } catch (error) {
        console.error('Error loading avatar:', error);
    }
});

// Controls setup
controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.minDistance = 3;
controls.maxDistance = 15;

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
            if (avatarMixer) {
                avatarMixer._actions[0].timeScale = 1;
            }
            if (keys.w) pedestrianAvatar.position.z += avatarSpeed;
            if (keys.s) pedestrianAvatar.position.z -= avatarSpeed;
            if (keys.a) pedestrianAvatar.position.x += avatarSpeed;
            if (keys.d) pedestrianAvatar.position.x -= avatarSpeed;
        } else if (avatarMixer) {
            avatarMixer._actions[0].timeScale = 0;
        }

        // Update controls target
        controls.target.copy(pedestrianAvatar.position);
    }

    // Update animation mixer
    if (avatarMixer) {
        avatarMixer.update(delta);
    }

    // Update controls
    controls.update();
    renderer.render(scene, camera);
}

// Initialize
loadBuildings();
animate();