<script lang="ts">
  import { onMount } from "svelte";
  import { invoke } from "@tauri-apps/api/core";
  import * as THREE from "three";

  let container: HTMLDivElement;
  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let bars: THREE.Mesh[] = [];
  let audioData: number[] = [];
  let barCount = 64;
  let inputDevices: string[] = [];
  let outputDevices: string[] = [];
  let cameraAngle = 0;

  onMount(async () => {
    // List audio devices for debugging
    try {
      const [inputs, outputs] = await invoke<[string[], string[]]>("list_audio_devices");
      inputDevices = inputs;
      outputDevices = outputs;
      console.log("Available input devices:", inputs);
      console.log("Available output devices:", outputs);
    } catch (e) {
      console.error("Failed to list audio devices", e);
    }

    // Three.js scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 40;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 0.5);
    directional.position.set(0, 1, 1);
    scene.add(directional);

    // Create bars
    const radius = 15;
    for (let i = 0; i < barCount; i++) {
      const geometry = new THREE.BoxGeometry(0.7, 0.7, 6);
      const material = new THREE.MeshStandardMaterial({ color: 0x00ffcc });
      const bar = new THREE.Mesh(geometry, material);
      const angle = (i / barCount) * Math.PI * 2;
      bar.position.x = Math.cos(angle) * radius;
      bar.position.y = Math.sin(angle) * radius;
      scene.add(bar);
      bars.push(bar);
    }

    fetchAudio();
    animate();
  });

  async function fetchAudio() {
    try {
      // get_audio_chunk returns Vec<f32> (array of floats)
      const result = await invoke<number[]>("get_audio_chunk");
      audioData = result || [];
    } catch (e) {
      console.error("Failed to fetch audio data:", e);
    }
    setTimeout(fetchAudio, 100); // poll every 100ms
  }

  function animate() {
    requestAnimationFrame(animate);
    // Animate camera in a circle for 3D effect
    cameraAngle += 0.008; // Adjust speed for taste
    const radius = 40;
    camera.position.x = Math.cos(cameraAngle) * radius;
    camera.position.z = Math.sin(cameraAngle) * radius;
    camera.position.y = Math.sin(cameraAngle * 0.7) * 10 + 10; // slight up/down for more 3D
    camera.lookAt(0, 0, 0);
    if (audioData && bars.length) {
      // Split audioData into barCount bins
      const binSize = Math.floor(audioData.length / barCount);
      for (let i = 0; i < barCount; i++) {
        let avg = 0;
        for (let j = 0; j < binSize; j++) {
          avg += Math.abs(audioData[i * binSize + j] || 0);
        }
        avg = avg / binSize;
        // Scale for visual effect
        const scale = (avg * 20) + 1;
        bars[i].scale.z = scale;
        bars[i].material.color.setHSL(avg, 0.7, 0.5);
      }
    }
    renderer.render(scene, camera);
  }
</script>

<main class="container">
  <h1>3D Audio Visualizer (Three.js + Svelte, System Audio)</h1>
  <div bind:this={container} class="viz-container"></div>
  <p>Playing system audio should animate the bars. If not, check backend logs and system audio setup.</p>

  <div class="audio-device-list">
    <h2>Input Devices</h2>
    <textarea readonly rows={Math.max(2, inputDevices.length)} style="width:100%">{inputDevices.join('\n')}</textarea>
    <h2>Output Devices</h2>
    <textarea readonly rows={Math.max(2, outputDevices.length)} style="width:100%">{outputDevices.join('\n')}</textarea>
  </div>
</main>

<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  background: radial-gradient(ellipse at center, #232526 0%, #1c1c1c 100%);
  color: #fff;
}
.viz-container {
  width: 720px;
  height: 480px;
  background: #111;
  margin: 2rem 0;
  border-radius: 1rem;
  box-shadow: 0 0 16px #00ffcc22;
}
h1 {
  margin-top: 2rem;
  font-size: 2.2rem;
  letter-spacing: 1px;
}
.audio-device-list {
  margin-top: 2rem;
}
</style>
