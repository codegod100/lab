import { useEffect, useRef, useState } from 'preact/hooks';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './app.css';

export function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [health, setHealth] = useState<number>(100);

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
      
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        antialias: true
      });

      // Enable basic shadows
      renderer.shadowMap.enabled = true;
      
      // Set clear color to a more neutral gray
      renderer.setClearColor(0x444444, 1.0); // Dark gray

      renderer.setSize(window.innerWidth, window.innerHeight);
      mountRef.current.appendChild(renderer.domElement);

      // Add debug info
      console.log('Three.js initialized successfully');
      console.log('WebGL renderer:', renderer.getContext().getParameter(renderer.getContext().VERSION));

      // Simple lighting setup
      // Brighter ambient light for better visibility
      const ambientLight = new THREE.AmbientLight(0xCCCCCC); 
      scene.add(ambientLight);

      // Stronger directional light (sun-like)
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
      directionalLight.position.set(1, 5, 2);
      directionalLight.castShadow = true;
      
      // Basic shadow settings
      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 1024;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 50;
      
      scene.add(directionalLight);

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

      // No tank markings

      // Add the entire tank to the scene
      scene.add(tank);

      // Create a more detailed battlefield arena
      const arenaSize = 50;

      // Base ground
      const arenaGeometry = new THREE.PlaneGeometry(arenaSize, arenaSize, 20, 20);
      const arenaMaterial = new THREE.MeshLambertMaterial({
        color: 0xA9A9A9, // Medium gray for terrain
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
        const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
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
        const barrierMaterial = new THREE.MeshLambertMaterial({ color: 0xDDDDDD });
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

      // Add enemy tanks as targets with movement and firing behavior
      const targets: { 
        tank: THREE.Group; 
        moveDirection: { x: number; z: number }; 
        speed: number;
        lastFired: number;
        fireRate: number;
      }[] = [];

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
        // Spawn tanks further away from the player's starting position
        let x, z;
        do {
          x = Math.random() * 40 - 20;
          z = Math.random() * 40 - 20;
        } while (Math.sqrt(x*x + z*z) < 15); // Ensure at least 15 units away from center
        
        enemyTank.position.set(
          x,
          0, // Place on the ground
          z
        );
        // Random rotation (tank front should face movement direction)
        const initialAngle = Math.random() * Math.PI * 2;
        enemyTank.rotation.y = initialAngle + Math.PI;
        scene.add(enemyTank);
        
        // Add tank with movement and firing properties
        const angle = Math.random() * Math.PI * 2;
        targets.push({
          tank: enemyTank,
          moveDirection: { 
            x: Math.sin(angle), 
            z: Math.cos(angle) 
          },
          speed: 0.03 + Math.random() * 0.02, // Random speed
          lastFired: 0,
          fireRate: 3000 + Math.random() * 4000, // Random time between shots (3-7 seconds)
          isAiming: false,
          aimStartTime: 0,
          originalDirection: null
        });
      }

      camera.position.set(0, 15, 15);
      const controls = new OrbitControls(camera, renderer.domElement);

      // Tank movement and player state
      const moveSpeed = 0.1;
      const rotateSpeed = 0.02;
      const keys: { [key: string]: boolean } = {};
      const projectiles: { mesh: THREE.Mesh, direction: { x: number, z: number } }[] = [];
      
      // Player health system
      const playerState = {
        health: 100,
        maxHealth: 100,
        isDead: false,
        lastHitTime: 0,
        hitCooldown: 500, // 500ms invulnerability after being hit
        respawnTime: 0 // Immediate respawn
      };

      const respawnTargets = () => {
        // Remove existing targets
        targets.forEach(target => scene.remove(target.tank));
        targets.length = 0;

        // Create new enemy tanks
        for (let i = 0; i < 5; i++) {
          const enemyTank = createEnemyTank();
          // Spawn tanks further away from the player's starting position
          let x, z;
          do {
            x = Math.random() * 40 - 20;
            z = Math.random() * 40 - 20;
          } while (Math.sqrt(x*x + z*z) < 15); // Ensure at least 15 units away from center
          
          enemyTank.position.set(
            x,
            0, // Place on the ground
            z
          );
          // Random rotation (tank front should face movement direction)
          const initialAngle = Math.random() * Math.PI * 2;
          enemyTank.rotation.y = initialAngle + Math.PI;
          scene.add(enemyTank);
          
          // Add tank with movement and firing properties
          const angle = Math.random() * Math.PI * 2;
          targets.push({
            tank: enemyTank,
            moveDirection: { 
              x: Math.sin(angle), 
              z: Math.cos(angle) 
            },
            speed: 0.03 + Math.random() * 0.02, // Random speed
            lastFired: 0,
            fireRate: 3000 + Math.random() * 4000, // Random time between shots (3-7 seconds)
            isAiming: false,
            aimStartTime: 0,
            originalDirection: null
          });
        }
      };

      // Simple muzzle flash
      const muzzleFlashGeometry = new THREE.SphereGeometry(0.3, 8, 8);
      const muzzleFlashMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00
      });
      const muzzleFlash = new THREE.Mesh(muzzleFlashGeometry, muzzleFlashMaterial);
      muzzleFlash.visible = false;
      scene.add(muzzleFlash);

      // Create projectile function
      const createProjectile = () => {
        try {
          console.log('Creating projectile');
          
          // Create projectile
          const projectileGeometry = new THREE.SphereGeometry(0.2, 16, 16);
          const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
          const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
          
          // Mark as from player for collision detection
          projectile.userData.fromPlayer = true;

          // Calculate direction based on tank rotation
          const direction = {
            x: -Math.sin(tank.rotation.y),
            z: -Math.cos(tank.rotation.y)
          };
          
          // Create projectile at the cannon tip position
          const cannonTip = new THREE.Vector3(0, 0.4, -4.2); // Position at the end of the cannon/muzzle
          tank.localToWorld(cannonTip); // Convert to world space
          console.log('Cannon tip position:', cannonTip);

          // Position projectile at cannon tip
          projectile.position.copy(cannonTip);

          // Show simple muzzle flash
          muzzleFlash.position.copy(cannonTip);
          muzzleFlash.visible = true;
          setTimeout(() => {
            muzzleFlash.visible = false;
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

      // Simple explosion sphere
      const explosionGeometry = new THREE.SphereGeometry(2, 8, 8);
      const explosionMaterial = new THREE.MeshBasicMaterial({
        color: 0xff8800,
        transparent: true,
        opacity: 0.7
      });
      const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
      explosion.visible = false;
      scene.add(explosion);

      // Event listeners
      const handleKeyDown = (event: KeyboardEvent) => {
        console.log('Key pressed:', event.code);
        keys[event.code] = true;
        if (event.code === 'Space' && !playerState.isDead) {
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
        
        // No fancy lighting updates needed
        
        // Don't allow movement when player is dead
        if (playerState.isDead) {
          return;
        }

        // Enemy tank movement and firing behavior
        const currentTime = Date.now();
        for (let i = 0; i < targets.length; i++) {
          const target = targets[i];
          const enemyTank = target.tank;
          
          // Make tank face direction of movement (rotate 180 degrees so front is forward)
          enemyTank.rotation.y = Math.atan2(target.moveDirection.x, target.moveDirection.z) + Math.PI;
          
          // Move enemy tank in the direction it's facing
          enemyTank.position.x += target.moveDirection.x * target.speed;
          enemyTank.position.z += target.moveDirection.z * target.speed;
          
          // Boundary check - change direction if hitting edge or about to fall off
          if (Math.abs(enemyTank.position.x) > arenaSize/2 - 5 || Math.abs(enemyTank.position.z) > arenaSize/2 - 5) {
            // Bounce off the edge with a new random direction
            const newAngle = Math.random() * Math.PI * 2;
            target.moveDirection.x = Math.sin(newAngle);
            target.moveDirection.z = Math.cos(newAngle);
          }
          
          // Check if it's time to fire
          if (currentTime - target.lastFired > target.fireRate) {
            // Calculate distance to player tank
            const distanceToPlayer = enemyTank.position.distanceTo(tank.position);
            
            // Only fire if in range
            if (distanceToPlayer < 25) {
              // Calculate direction toward player tank
              const dirToPlayer = new THREE.Vector3();
              dirToPlayer.subVectors(tank.position, enemyTank.position).normalize();
              
              // Set aiming mode - stop moving and track player
              if (!target.isAiming) {
                target.isAiming = true;
                target.aimStartTime = currentTime;
                target.originalDirection = { ...target.moveDirection };
                target.moveDirection = { x: 0, z: 0 }; // Stop moving while aiming
              }
              
              // Turn to face player before firing (rotate 180 degrees so front faces player)
              enemyTank.rotation.y = Math.atan2(dirToPlayer.x, dirToPlayer.z) + Math.PI;
              
              // Only fire after aiming for a moment (gives player time to see it aiming)
              if (currentTime - target.aimStartTime > 800) { // 800ms aiming delay
                // Fire projectile toward player
                const projectileGeometry = new THREE.SphereGeometry(0.2, 8, 8);
                const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
                
                // Mark as from enemy for collision detection
                projectile.userData.fromPlayer = false;
                
                // Position at enemy tank cannon
                const enemyCannonTip = new THREE.Vector3(0, 0.4, -4.2);
                enemyTank.localToWorld(enemyCannonTip);
                projectile.position.copy(enemyCannonTip);
                
                // Direction toward player
                const direction = {
                  x: dirToPlayer.x,
                  z: dirToPlayer.z
                };
                
                scene.add(projectile);
                projectiles.push({ mesh: projectile, direction });
                
                // Update last fired time
                target.lastFired = currentTime;
                
                // Reset to movement mode
                target.isAiming = false;
                target.moveDirection = target.originalDirection;
              }
            } else if (target.isAiming) {
              // If no longer in range but was aiming, reset to movement mode
              target.isAiming = false;
              target.moveDirection = target.originalDirection || { 
                x: Math.sin(Math.random() * Math.PI * 2),
                z: Math.cos(Math.random() * Math.PI * 2)
              };
            }
          }
        }
        
        // Projectile movement and collision detection
        for (let i = projectiles.length - 1; i >= 0; i--) {
          const { mesh, direction } = projectiles[i];
          mesh.position.x += direction.x * 0.5;
          mesh.position.z += direction.z * 0.5;
          
          // Remove projectiles that go too far
          if (Math.abs(mesh.position.x) > arenaSize/2 || Math.abs(mesh.position.z) > arenaSize/2) {
            scene.remove(mesh);
            projectiles.splice(i, 1);
            continue;
          }

          // Check for collisions with player tank (only enemy projectiles can hit player)
          if (mesh.position.distanceTo(tank.position) < 2.5 && mesh.userData.fromPlayer === false && !playerState.isDead) {
            // Check if invulnerability has worn off
            const currentTime = Date.now();
            if (currentTime - playerState.lastHitTime > playerState.hitCooldown) {
              // Simple explosion effect
              const impactPos = mesh.position.clone();
              
              // Show explosion
              explosion.position.copy(impactPos);
              explosion.position.y += 1;
              explosion.visible = true;
              
              setTimeout(() => {
                explosion.visible = false;
              }, 300);
              
              // Remove projectile
              scene.remove(mesh);
              projectiles.splice(i, 1);
              
              // Decrease player health
              playerState.health -= 20; // Each hit takes 20 health
              playerState.lastHitTime = currentTime;
              
              // Update React state for health display
              setHealth(playerState.health);
              
              console.log("Player hit! Health:", playerState.health);
              
              // Check if player is dead
              if (playerState.health <= 0 && !playerState.isDead) {
                playerState.isDead = true;
                playerState.health = 0;
                
                // Create large explosion
                const bigExplosion = explosion.clone();
                bigExplosion.scale.set(3, 3, 3);
                bigExplosion.position.copy(tank.position);
                bigExplosion.position.y += 1;
                bigExplosion.visible = true;
                scene.add(bigExplosion);
                
                // Hide the tank when dead
                tank.visible = false;
                
                console.log("Player tank destroyed!");
                
                // Auto-respawn after delay
                setTimeout(() => {
                  // Reset player state
                  playerState.health = playerState.maxHealth;
                  playerState.isDead = false;
                  
                  // Update React state for health display
                  setHealth(playerState.maxHealth);
                  
                  // Reset tank position
                  tank.position.set(0, 0, 0);
                  tank.rotation.y = 0;
                  tank.visible = true;
                  
                  // Remove explosion effect
                  scene.remove(bigExplosion);
                  
                  console.log("Player respawned!");
                }, playerState.respawnTime);
              }
            }
            
            continue;
          }

          // Check for collisions with enemy tanks
          for (let j = targets.length - 1; j >= 0; j--) {
            const enemyTank = targets[j].tank;
            // Use a more accurate collision detection for the tank
            // Check distance to the center of the enemy tank with a slightly larger radius
            if (mesh.position.distanceTo(enemyTank.position) < 2.5 && mesh.userData.fromPlayer === true) {
              // Simple explosion effect
              const impactPos = enemyTank.position.clone();
              
              // Show basic explosion sphere
              explosion.position.copy(impactPos);
              explosion.position.y += 1; // Position slightly above the ground
              explosion.visible = true;
              
              // Hide explosion after a short delay
              setTimeout(() => {
                explosion.visible = false;
              }, 300);

              // Remove enemy tank and projectile
              scene.remove(enemyTank);
              targets.splice(j, 1);
              scene.remove(mesh);
              projectiles.splice(i, 1);

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
        if (mountRef.current) {
          const width = window.innerWidth;
          const height = window.innerHeight;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
        }
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
    <div ref={mountRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        color: 'white',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '5px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <div>Controls:</div>
        <div>W: Move Forward</div>
        <div>S: Move Backward</div>
        <div>A: Turn Left</div>
        <div>D: Turn Right</div>
        <div>Space: Fire</div>
        <div>R: Respawn Targets</div>
      </div>
      
      {/* Health bar */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '300px',
        height: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '10px',
        overflow: 'hidden',
        zIndex: 1000
      }}>
        <div style={{
          width: `${health}%`,
          height: '100%',
          backgroundColor: health > 60 ? '#44ff44' : health > 30 ? '#ffff44' : '#ff4444',
          transition: 'width 0.3s, background-color 0.3s'
        }} />
      </div>
    </div>
  );
}

export default App;
