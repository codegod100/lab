import { useEffect, useRef } from 'preact/hooks';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './app.css';

export function App() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('useEffect triggered');
    if (!mountRef.current) {
      console.log('mountRef is null');
      return;
    }

    try {
      console.log('Initializing Three.js');

      // Scene, Camera, Renderer
      const scene = new THREE.Scene();
      
      // Add fog for depth and atmosphere
      scene.fog = new THREE.FogExp2(0x87CEEB, 0.005); // Reduced blue fog density for better visibility
      
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance"
      });

      // Enable shadows and improve renderer quality
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadow edges
      
      // Note: Using compatible properties for this version of Three.js
      renderer.toneMapping = THREE.ACESFilmicToneMapping; // Better contrast
      renderer.toneMappingExposure = 1.3; // Increased exposure for brighter scene
      
      // Set clear color to a slightly lighter blue for better ambient lighting
      renderer.setClearColor(0x87CEEB, 0.8); // Light sky blue with some transparency

      renderer.setSize(window.innerWidth, window.innerHeight);
      mountRef.current.appendChild(renderer.domElement);

      // Add debug info
      console.log('Three.js initialized successfully');
      console.log('WebGL renderer:', renderer.getContext().getParameter(renderer.getContext().VERSION));

      // Lighting
      // Brighter ambient light for better overall illumination
      const ambientLight = new THREE.AmbientLight(0x808080); // Increased from 0x404040 to 0x808080
      // scene.add(ambientLight);

      // Enhanced main directional light (sun-like)
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Increased intensity from 0.5 to 0.8
      directionalLight.position.set(1, 3, 1);
      directionalLight.castShadow = true; // Enable shadows for depth
      
      // Configure shadow properties for better quality
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 50;
      directionalLight.shadow.camera.left = -20;
      directionalLight.shadow.camera.right = 20;
      directionalLight.shadow.camera.top = 20;
      directionalLight.shadow.camera.bottom = -20;
      directionalLight.shadow.bias = -0.0005;
      
      // scene.add(directionalLight);
      
      // Add a secondary directional light from the opposite direction for fill lighting
      const fillLight = new THREE.DirectionalLight(0xffffcc, 0.4); // Slight yellow tint
      fillLight.position.set(-1, 2, -1);
      // scene.add(fillLight);
      
      // Add a hemisphere light to simulate sky and ground reflected light
      const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x8B7355, 0.8); // Sky blue and ground color
      scene.add(hemisphereLight);
      
      // Add a spotlight that follows the player's tank for dramatic effect
      const spotlight = new THREE.SpotLight(0xffffff, 1.5);
      spotlight.position.set(0, 15, 0);
      spotlight.angle = Math.PI / 6; // Narrow beam
      spotlight.penumbra = 0.3; // Soft edges
      spotlight.decay = 1.5;
      spotlight.distance = 30;
      spotlight.castShadow = true;
      spotlight.shadow.mapSize.width = 1024;
      spotlight.shadow.mapSize.height = 1024;
      // scene.add(spotlight);
      
      // Add a subtle point light to simulate light bouncing off the ground
      const groundLight = new THREE.PointLight(0xffffcc, 0.3);
      groundLight.position.set(0, 0.2, 0);
      groundLight.distance = 10;
      // scene.add(groundLight);

      // Tank and Arena
      // Create a tank group to hold all tank parts
      const tank = new THREE.Group();

      // Tank body (hull) - lower profile
      const tankBodyGeometry = new THREE.BoxGeometry(2, 0.6, 3);
      const tankBodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4d5d53 }); // Olive drab (military green)
      const tankBody = new THREE.Mesh(tankBodyGeometry, tankBodyMaterial);
      tankBody.position.y = 0.3; // Half of its height
      tankBody.castShadow = true; // Cast shadows
      tank.add(tankBody);
      
      // Main gun housing that extends from the front of the tank
      const gunHousingGeometry = new THREE.BoxGeometry(0.8, 0.4, 1.2);
      const gunHousingMaterial = new THREE.MeshLambertMaterial({ color: 0x3d4d43 }); // Darker green
      const gunHousing = new THREE.Mesh(gunHousingGeometry, gunHousingMaterial);
      gunHousing.position.set(0, 0.4, -1.8); // Position at the front of the tank
      gunHousing.castShadow = true;
      tank.add(gunHousing);

      // Tank tracks (left)
      const trackLeftGeometry = new THREE.BoxGeometry(0.4, 0.5, 3.2);
      const trackMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 }); // Dark gray/black
      const trackLeft = new THREE.Mesh(trackLeftGeometry, trackMaterial);
      trackLeft.position.set(-0.9, 0.25, 0);
      trackLeft.castShadow = true; // Cast shadows
      tank.add(trackLeft);

      // Track wheels (left)
      for (let i = -1; i <= 1; i++) {
        const wheelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 8);
        const wheel = new THREE.Mesh(wheelGeometry, trackMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(-0.9, 0.2, i * 1.0);
        wheel.castShadow = true; // Cast shadows
        tank.add(wheel);
      }

      // Tank tracks (right)
      const trackRightGeometry = new THREE.BoxGeometry(0.4, 0.5, 3.2);
      const trackRight = new THREE.Mesh(trackRightGeometry, trackMaterial);
      trackRight.position.set(0.9, 0.25, 0);
      trackRight.castShadow = true; // Cast shadows
      tank.add(trackRight);

      // Track wheels (right)
      for (let i = -1; i <= 1; i++) {
        const wheelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 8);
        const wheel = new THREE.Mesh(wheelGeometry, trackMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(0.9, 0.2, i * 1.0);
        wheel.castShadow = true; // Cast shadows
        tank.add(wheel);
      }

      // Main cannon - positioned horizontally at the front of the tank
      const cannonGeometry = new THREE.CylinderGeometry(0.15, 0.15, 2.5, 16);
      const cannonMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
      const cannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
      cannon.position.set(0, 0.4, -3.0); // Position extending from the front of the tank
      cannon.rotation.x = Math.PI / 2; // Rotate to point forward (parallel to ground)
      cannon.castShadow = true;
      tank.add(cannon);
      
      // Add a muzzle brake to the cannon
      const muzzleBrakeGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 8);
      const muzzleBrake = new THREE.Mesh(muzzleBrakeGeometry, cannonMaterial);
      muzzleBrake.position.set(0, 0.4, -4.2); // Position at the end of the cannon
      muzzleBrake.rotation.x = Math.PI / 2; // Match cannon rotation
      muzzleBrake.castShadow = true;
      tank.add(muzzleBrake);
      
      // Small turret on top (smaller than before)
      const turretGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.3, 16);
      const turretMaterial = new THREE.MeshLambertMaterial({ color: 0x3d4d43 }); // Darker green for turret
      const turret = new THREE.Mesh(turretGeometry, turretMaterial);
      turret.position.set(0, 0.75, 0.5); // Position on top of the body, toward the back
      turret.rotation.x = Math.PI / 2; // Rotate to lie flat
      turret.castShadow = true; // Cast shadows
      tank.add(turret);

      // Add a machine gun on top of the turret
      const mgGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
      const machineGun = new THREE.Mesh(mgGeometry, cannonMaterial);
      machineGun.position.set(0, 0.4, 0);
      machineGun.rotation.x = Math.PI / 2;
      turret.add(machineGun);

      // Add a commander's hatch
      const hatchGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 8);
      const hatchMaterial = new THREE.MeshLambertMaterial({ color: 0x2d3d33 });
      const hatch = new THREE.Mesh(hatchGeometry, hatchMaterial);
      hatch.position.set(0, 0.3, 0.5);
      turret.add(hatch);

      // Add tank markings (star on the side)
      const starGeometry = new THREE.CircleGeometry(0.3, 5);
      const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const star = new THREE.Mesh(starGeometry, starMaterial);
      star.position.set(-1.01, 0.6, -0.5);
      star.rotation.y = Math.PI / 2;
      tank.add(star);

      // Add the entire tank to the scene
      scene.add(tank);

      // Create a more detailed battlefield arena
      const arenaSize = 50;

      // Base ground
      const arenaGeometry = new THREE.PlaneGeometry(arenaSize, arenaSize, 20, 20);
      const arenaMaterial = new THREE.MeshLambertMaterial({
        color: 0x8B7355, // Sandy brown color
        wireframe: false
      });
      const arena = new THREE.Mesh(arenaGeometry, arenaMaterial);
      arena.rotation.x = -Math.PI / 2;
      arena.receiveShadow = true; // Make the ground receive shadows
      scene.add(arena);

      // Add some terrain variation (hills and craters)
      const vertices = arenaGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < vertices.length; i += 3) {
        // Skip the edges to keep a flat boundary
        const x = vertices[i];
        const z = vertices[i + 2];
        if (Math.abs(x) < arenaSize / 2 - 5 && Math.abs(z) < arenaSize / 2 - 5) {
          // Create some random terrain height
          const distance = Math.sqrt(x * x + z * z);
          vertices[i + 1] =
            Math.sin(x * 0.5) * Math.cos(z * 0.3) * 0.5 + // Gentle rolling hills
            Math.random() * 0.2 - 0.1; // Small random variation

          // Add some craters
          const craterCenters = [
            { x: -10, z: 15, radius: 5 },
            { x: 12, z: -8, radius: 3 },
            { x: -5, z: -12, radius: 4 }
          ];

          for (const crater of craterCenters) {
            const craterDist = Math.sqrt(
              Math.pow(x - crater.x, 2) +
              Math.pow(z - crater.z, 2)
            );
            if (craterDist < crater.radius) {
              // Create a depression for the crater
              vertices[i + 1] -= 0.5 * Math.cos((craterDist / crater.radius) * Math.PI / 2);
            }
          }
        }
      }
      arenaGeometry.attributes.position.needsUpdate = true;
      arenaGeometry.computeVertexNormals();

      // Add some obstacles (rocks and barriers)
      const addRock = (x: number, z: number, scale: number) => {
        const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
        const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(x, scale / 2, z);
        rock.scale.set(scale, scale, scale);
        rock.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        rock.castShadow = true; // Cast shadows
        rock.receiveShadow = true; // Also receive shadows from other rocks
        scene.add(rock);
      };

      // Add some scattered rocks
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * arenaSize - arenaSize / 2;
        const z = Math.random() * arenaSize - arenaSize / 2;
        // Keep rocks away from the center starting area
        if (Math.sqrt(x * x + z * z) > 10) {
          addRock(x, z, Math.random() * 1.5 + 0.5);
        }
      }

      // Add some concrete barriers
      const addBarrier = (x: number, z: number, rotation: number) => {
        const barrierGeometry = new THREE.BoxGeometry(0.6, 1, 3);
        const barrierMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
        const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
        barrier.position.set(x, 0.5, z);
        barrier.rotation.y = rotation;
        barrier.castShadow = true; // Cast shadows
        barrier.receiveShadow = true; // Also receive shadows
        scene.add(barrier);
      };

      // Create a few barrier formations
      for (let i = 0; i < 3; i++) {
        const centerX = Math.random() * 30 - 15;
        const centerZ = Math.random() * 30 - 15;
        // Keep barriers away from the center starting area
        if (Math.sqrt(centerX * centerX + centerZ * centerZ) > 15) {
          const rotation = Math.random() * Math.PI;
          // Create a small formation of 3 barriers
          addBarrier(centerX, centerZ, rotation);
          addBarrier(centerX + Math.cos(rotation) * 3, centerZ + Math.sin(rotation) * 3, rotation);
          addBarrier(centerX - Math.cos(rotation) * 3, centerZ - Math.sin(rotation) * 3, rotation);
        }
      }

      // Add enemy tanks as targets
      const targets: THREE.Group[] = [];

      // Function to create an enemy tank
      const createEnemyTank = () => {
        // Create a tank group to hold all tank parts
        const enemyTank = new THREE.Group();

        // Tank body (hull) - lower profile
        const tankBodyGeometry = new THREE.BoxGeometry(2, 0.6, 3);
        const tankBodyMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 }); // Dark red
        const tankBody = new THREE.Mesh(tankBodyGeometry, tankBodyMaterial);
        tankBody.position.y = 0.3; // Half of its height
        tankBody.castShadow = true; // Cast shadows
        enemyTank.add(tankBody);
        
        // Main gun housing that extends from the front of the tank
        const gunHousingGeometry = new THREE.BoxGeometry(0.8, 0.4, 1.2);
        const gunHousingMaterial = new THREE.MeshLambertMaterial({ color: 0x990000 }); // Darker red
        const gunHousing = new THREE.Mesh(gunHousingGeometry, gunHousingMaterial);
        gunHousing.position.set(0, 0.4, -1.8); // Position at the front of the tank
        gunHousing.castShadow = true;
        enemyTank.add(gunHousing);

        // Tank tracks (left)
        const trackLeftGeometry = new THREE.BoxGeometry(0.4, 0.5, 3.2);
        const trackMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 }); // Dark gray/black
        const trackLeft = new THREE.Mesh(trackLeftGeometry, trackMaterial);
        trackLeft.position.set(-0.9, 0.25, 0);
        trackLeft.castShadow = true; // Cast shadows
        enemyTank.add(trackLeft);

        // Tank tracks (right)
        const trackRightGeometry = new THREE.BoxGeometry(0.4, 0.5, 3.2);
        const trackRight = new THREE.Mesh(trackRightGeometry, trackMaterial);
        trackRight.position.set(0.9, 0.25, 0);
        trackRight.castShadow = true; // Cast shadows
        enemyTank.add(trackRight);

        // Main cannon - positioned horizontally at the front of the tank
        const cannonGeometry = new THREE.CylinderGeometry(0.15, 0.15, 2.5, 16);
        const cannonMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const cannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
        cannon.position.set(0, 0.4, -3.0); // Position extending from the front of the tank
        cannon.rotation.x = Math.PI / 2; // Rotate to point forward (parallel to ground)
        cannon.castShadow = true;
        enemyTank.add(cannon);
        
        // Add a muzzle brake to the cannon
        const muzzleBrakeGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 8);
        const muzzleBrake = new THREE.Mesh(muzzleBrakeGeometry, cannonMaterial);
        muzzleBrake.position.set(0, 0.4, -4.2); // Position at the end of the cannon
        muzzleBrake.rotation.z = Math.PI / 2;
        muzzleBrake.castShadow = true;
        enemyTank.add(muzzleBrake);
        
        // Small turret on top (smaller than before)
        const turretGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.3, 16);
        const turretMaterial = new THREE.MeshLambertMaterial({ color: 0x990000 }); // Slightly lighter red
        const turret = new THREE.Mesh(turretGeometry, turretMaterial);
        turret.position.set(0, 0.75, 0.5); // Position on top of the body, toward the back
        turret.rotation.x = Math.PI / 2; // Rotate to lie flat
        turret.castShadow = true; // Cast shadows
        enemyTank.add(turret);

        return enemyTank;
      };

      // Create enemy tanks
      for (let i = 0; i < 5; i++) {
        const enemyTank = createEnemyTank();
        enemyTank.position.set(
          Math.random() * 30 - 15,
          0, // Place on the ground
          Math.random() * 30 - 15
        );
        // Random rotation
        enemyTank.rotation.y = Math.random() * Math.PI * 2;
        scene.add(enemyTank);
        targets.push(enemyTank);
      }

      camera.position.set(0, 10, 10);
      const controls = new OrbitControls(camera, renderer.domElement);

      // Tank movement
      const moveSpeed = 0.1;
      const rotateSpeed = 0.02;
      const keys: { [key: string]: boolean } = {};
      const projectiles: { mesh: THREE.Mesh, direction: { x: number, z: number } }[] = [];

      const respawnTargets = () => {
        // Remove existing targets
        targets.forEach(target => scene.remove(target));
        targets.length = 0;

        // Create new enemy tanks
        for (let i = 0; i < 5; i++) {
          const enemyTank = createEnemyTank();
          enemyTank.position.set(
            Math.random() * 30 - 15,
            0, // Place on the ground
            Math.random() * 30 - 15
          );
          // Random rotation
          enemyTank.rotation.y = Math.random() * Math.PI * 2;
          scene.add(enemyTank);
          targets.push(enemyTank);
        }
      };

      // Create enhanced muzzle flash with glow effect
      const muzzleFlashGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const muzzleFlashMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.8
      });
      const muzzleFlash = new THREE.Mesh(muzzleFlashGeometry, muzzleFlashMaterial);
      muzzleFlash.visible = false;
      scene.add(muzzleFlash);
      
      // Add a point light for the muzzle flash glow
      const muzzleLight = new THREE.PointLight(0xffff00, 3, 5);
      muzzleLight.visible = false;
      scene.add(muzzleLight);

      // Create projectile function
      const createProjectile = () => {
        try {
          console.log('Creating projectile');
          
          // Debug the tank structure
          console.log('Tank children count:', tank.children.length);
          tank.children.forEach((child, index) => {
            console.log(`Tank child ${index}:`, child.type, child);
          });
          
          // Find the cannon directly in the tank's children
          let cannon: THREE.Object3D | null = null;
          let cannonIndex = -1;
          
          for (let i = 0; i < tank.children.length; i++) {
            const child = tank.children[i];
            if (child.type === 'Mesh' &&
                (child as THREE.Mesh).geometry.type === 'CylinderGeometry' &&
                Math.abs((child as THREE.Mesh).position.z + 3.0) < 0.5) { // Check if position matches main cannon
              console.log(`Found cannon at index ${i}`);
              cannon = child;
              cannonIndex = i;
              break;
            }
          }
          
          if (!cannon) {
            console.error('Cannon not found in tank children');
            
            // Create a temporary cannon tip position based on the tank's position
            const cannonTip = new THREE.Vector3();
            tank.getWorldPosition(cannonTip);
            cannonTip.z -= 4.0; // Position at the front of the tank
            
            // Create projectile at this position
            const projectileGeometry = new THREE.SphereGeometry(0.2, 16, 16);
            const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
            
            // Position projectile at approximate cannon tip
            projectile.position.copy(cannonTip);
            
            // Calculate direction based on tank rotation
            const direction = {
              x: -Math.sin(tank.rotation.y),
              z: -Math.cos(tank.rotation.y)
            };
            
            // Show muzzle flash with glow effect
            muzzleFlash.position.copy(cannonTip);
            muzzleFlash.visible = true;
            // Position and show the muzzle light for glow effect
            muzzleLight.position.copy(cannonTip);
            muzzleLight.visible = true;
            setTimeout(() => {
              muzzleFlash.visible = false;
              muzzleLight.visible = false;
            }, 100);
            
            scene.add(projectile);
            projectiles.push({ mesh: projectile, direction });
            console.log('Projectile created at approximate position');
            return;
          }
          
          console.log(`Using cannon at index ${cannonIndex}:`, cannon);

          // Create projectile
          const projectileGeometry = new THREE.SphereGeometry(0.2, 16, 16);
          const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
          const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);

          // Calculate direction based on tank rotation
          const direction = {
            x: -Math.sin(tank.rotation.y),
            z: -Math.cos(tank.rotation.y)
          };

          // Get the world position of the cannon tip at the front of the tank
          const cannonTip = new THREE.Vector3(0, 0, -1.5); // Half the length of the cannon
          cannon.localToWorld(cannonTip);
          console.log('Cannon tip position:', cannonTip);

          // Position projectile at cannon tip
          projectile.position.copy(cannonTip);

          // Show muzzle flash at cannon tip with glow effect
          muzzleFlash.position.copy(cannonTip);
          muzzleFlash.visible = true;
          // Position and show the muzzle light for glow effect
          muzzleLight.position.copy(cannonTip);
          muzzleLight.visible = true;
          setTimeout(() => {
            muzzleFlash.visible = false;
            muzzleLight.visible = false;
          }, 100);

          // Add recoil effect
          if (cannon.position && cannon.position.z !== undefined) {
            const originalCannonPos = cannon.position.z;
            cannon.position.z += 0.2; // Move cannon back
            setTimeout(() => {
              cannon.position.z = originalCannonPos; // Return to original position
            }, 100);
          }

          scene.add(projectile);
          projectiles.push({ mesh: projectile, direction });
          console.log('Projectile created and added to scene');
        } catch (error) {
          console.error('Error creating projectile:', error);
        }
      };

      // Mega boom explosion system
      const particleCount = 1000;
      const particles = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      const particleSizes = new Float32Array(particleCount);
      const particleColors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3] = 0;
        particlePositions[i * 3 + 1] = 0;
        particlePositions[i * 3 + 2] = 0;
        particleSizes[i] = Math.random() * 1.5 + 0.5;

        // Fiery colors with more variation
        const color = new THREE.Color(
          Math.random() * 0.7 + 0.3,  // R
          Math.random() * 0.4,        // G
          Math.random() * 0.1         // B
        );
        color.toArray(particleColors, i * 3);
      }

      particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      particles.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
      particles.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

      const particleMaterial = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending
      });

      const particleSystem = new THREE.Points(particles, particleMaterial);
      particleSystem.visible = false;
      scene.add(particleSystem);

      // Intense flash light for explosions
      const flashLight = new THREE.PointLight(0xff5500, 8, 30); // Increased intensity and range
      flashLight.visible = false;
      scene.add(flashLight);
      
      // Secondary explosion light for more dramatic effect
      const explosionLight = new THREE.PointLight(0xff8800, 4, 15);
      explosionLight.visible = false;
      scene.add(explosionLight);

      // Shockwave sphere
      const shockwaveGeometry = new THREE.SphereGeometry(1, 16, 16);
      const shockwaveMaterial = new THREE.MeshBasicMaterial({
        color: 0xff8800,
        transparent: true,
        opacity: 0.7,
        wireframe: true
      });
      const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
      shockwave.visible = false;
      scene.add(shockwave);

      // Event listeners
      const handleKeyDown = (event: KeyboardEvent) => {
        console.log('Key pressed:', event.code);
        keys[event.code] = true;
        if (event.code === 'Space') {
          console.log('Space key pressed - attempting to fire');
          createProjectile();
        } else if (event.code === 'KeyR') {
          console.log('R key pressed - respawning targets');
          respawnTargets();
        }
      };

      const handleKeyUp = (event: KeyboardEvent) => {
        keys[event.code] = false;
      };

      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);

      // Animation
      const animate = () => {
        requestAnimationFrame(animate);

        if (keys['KeyW']) {
          tank.position.x -= Math.sin(tank.rotation.y) * moveSpeed;
          tank.position.z -= Math.cos(tank.rotation.y) * moveSpeed;
        }
        if (keys['KeyS']) {
          tank.position.x += Math.sin(tank.rotation.y) * moveSpeed;
          tank.position.z += Math.cos(tank.rotation.y) * moveSpeed;
        }
        if (keys['KeyA']) {
          tank.rotation.y += rotateSpeed;
        }
        if (keys['KeyD']) {
          tank.rotation.y -= rotateSpeed;
        }
        
        // Update spotlight position to follow the tank
        spotlight.position.set(tank.position.x, 15, tank.position.z);
        spotlight.target = tank;
        
        // Update ground light to follow the tank
        groundLight.position.set(tank.position.x, 0.2, tank.position.z);

        // Projectile movement and collision detection
        for (let i = projectiles.length - 1; i >= 0; i--) {
          const { mesh, direction } = projectiles[i];
          mesh.position.x += direction.x * 0.5;
          mesh.position.z += direction.z * 0.5;

          // Check for collisions with enemy tanks
          for (let j = targets.length - 1; j >= 0; j--) {
            const enemyTank = targets[j];
            // Use a more accurate collision detection for the tank
            // Check distance to the center of the enemy tank with a slightly larger radius
            if (mesh.position.distanceTo(enemyTank.position) < 2.5) {
              // Mega boom explosion effect
              const impactPos = enemyTank.position.clone();

              // Position all effects at impact point
              particleSystem.position.copy(impactPos);
              shockwave.position.copy(impactPos);
              shockwave.scale.set(0.1, 0.1, 0.1);

              // Animate particles outward with more force
              const positions = particles.attributes.position.array as Float32Array;
              for (let k = 0; k < particleCount; k++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 0.5 + 0.3; // Faster particles
                positions[k * 3] = Math.cos(angle) * speed;
                positions[k * 3 + 1] = Math.random() * 0.5 - 0.1; // More upward spread
                positions[k * 3 + 2] = Math.sin(angle) * speed;
              }
              particles.attributes.position.needsUpdate = true;
              particleSystem.visible = true;

              // Show shockwave
              shockwave.visible = true;
              const shockwaveStartTime = Date.now();
              const shockwaveInterval = setInterval(() => {
                const elapsed = Date.now() - shockwaveStartTime;
                const progress = elapsed / 300; // 300ms duration
                if (progress >= 1) {
                  clearInterval(shockwaveInterval);
                  shockwave.visible = false;
                } else {
                  shockwave.scale.set(progress * 10, progress * 10, progress * 10);
                  shockwaveMaterial.opacity = 0.7 * (1 - progress);
                }
              }, 16);

              // Intense flash with dual lights for more dramatic effect
              flashLight.position.copy(impactPos);
              flashLight.position.y += 1; // Position slightly above the ground
              flashLight.visible = true;
              
              // Position secondary explosion light slightly offset for more dynamic lighting
              explosionLight.position.copy(impactPos);
              explosionLight.position.y += 0.5;
              explosionLight.visible = true;
              
              // Fade out lights with different timings
              setTimeout(() => {
                flashLight.visible = false;
              }, 150);
              
              setTimeout(() => {
                explosionLight.visible = false;
              }, 300);

              // Camera shake
              const originalCamPos = camera.position.clone();
              const shakeIntensity = 0.5;
              const shakeInterval = setInterval(() => {
                camera.position.x = originalCamPos.x + (Math.random() - 0.5) * shakeIntensity;
                camera.position.y = originalCamPos.y + (Math.random() - 0.5) * shakeIntensity;
              }, 50);
              setTimeout(() => {
                clearInterval(shakeInterval);
                camera.position.copy(originalCamPos);
              }, 200);

              // Remove enemy tank and projectile
              scene.remove(enemyTank);
              targets.splice(j, 1);
              scene.remove(mesh);
              projectiles.splice(i, 1);

              // Hide particles after delay
              setTimeout(() => {
                particleSystem.visible = false;
              }, 500);
              break;
            }
          }
        }

        controls.update();
        renderer.render(scene, camera);
      };

      animate();

      // Handle window resizing
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', handleResize);

      // Cleanup function
      return () => {
        console.log('Cleanup function called');
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        if (mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
      };
    } catch (err: unknown) {
      console.error('Three.js initialization failed:', err);
      if (mountRef.current) {
        mountRef.current.innerHTML = `<div style="color:red;padding:20px;">
          <h3>Initialization Error</h3>
          <p>${err instanceof Error ? err.message : String(err)}</p>
        </div>`;
      }
      return () => {
        console.log('Cleanup after error');
      };
    }
  }, []);

  return (
    <div ref={mountRef} style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        color: 'white',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '5px',
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        <div>Controls:</div>
        <div>W: Move Forward</div>
        <div>S: Move Backward</div>
        <div>A: Turn Left</div>
        <div>D: Turn Right</div>
        <div>Space: Fire</div>
        <div>R: Respawn Targets</div>
      </div>
    </div>
  );
}

export default App;
