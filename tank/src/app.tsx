import { useEffect, useRef } from 'preact/hooks';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './app.css';

export function App() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Tank and Arena
    const tankGeometry = new THREE.BoxGeometry(2, 1, 3);
    const tankMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    const tank = new THREE.Mesh(tankGeometry, tankMaterial);
    scene.add(tank);

    const arenaGeometry = new THREE.PlaneGeometry(50, 50, 1, 1);
    const arenaMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const arena = new THREE.Mesh(arenaGeometry, arenaMaterial);
    arena.rotation.x = -Math.PI / 2;
    scene.add(arena);

    // Add targets
    const targets: THREE.Mesh[] = [];
    const targetGeometry = new THREE.BoxGeometry(2, 2, 2);
    const targetMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff });

    for (let i = 0; i < 5; i++) {
      const target = new THREE.Mesh(targetGeometry, targetMaterial);
      target.position.set(
        Math.random() * 30 - 15,
        1,
        Math.random() * 30 - 15
      );
      scene.add(target);
      targets.push(target);
    }

    camera.position.set(0, 10, 20);
    const controls = new (OrbitControls)(camera, renderer.domElement);

    // Tank movement
    const moveSpeed = 0.1;
    const rotateSpeed = 0.02;
    const keys: { [key: string]: boolean } = {};
    const projectiles: { mesh: THREE.Mesh, direction: { x: number, z: number } }[] = [];

    document.addEventListener('keydown', (event) => {
      keys[event.code] = true;
      if (event.code === 'Space') {
        // Create projectile
        const projectileGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
        const direction = {
          x: -Math.sin(tank.rotation.y),
          z: -Math.cos(tank.rotation.y)
        };
        projectile.position.set(
          tank.position.x + direction.x * 2,
          tank.position.y,
          tank.position.z + direction.z * 2
        );
        scene.add(projectile);
        projectiles.push({ mesh: projectile, direction });
      }
    });

    document.addEventListener('keyup', (event) => {
      keys[event.code] = false;
    });

    // Particle system for target hits
    const particleCount = 100;
    const particles = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = 0;
      particlePositions[i * 3 + 1] = 0;
      particlePositions[i * 3 + 2] = 0;
      particleSizes[i] = Math.random() * 0.5 + 0.1;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xff9900,
      size: 0.2,
      transparent: true,
      opacity: 0.8
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    particleSystem.visible = false;
    scene.add(particleSystem);

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

      // Projectile movement and collision detection
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const { mesh, direction } = projectiles[i];
        mesh.position.x += direction.x * 0.5;
        mesh.position.z += direction.z * 0.5;

        // Check for collisions with targets
        for (let j = targets.length - 1; j >= 0; j--) {
          const target = targets[j];
          if (mesh.position.distanceTo(target.position) < 2) {
            // Show particle effect at collision point
            particleSystem.position.copy(target.position);
            particleSystem.visible = true;

            // Remove target and projectile
            scene.remove(target);
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

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      document.removeEventListener('keydown', () => { });
      document.removeEventListener('keyup', () => { });
    };
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
      </div>
    </div>
  )
}
