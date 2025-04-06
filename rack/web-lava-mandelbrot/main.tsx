/** @jsx h */
/** @jsxFrag Fragment */
import { h, render, Fragment } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';

interface LavaBlob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

function calculateSpatialEntropy(
  blobs: LavaBlob[],
  canvasWidth: number,
  canvasHeight: number,
  gridCols: number,
  gridRows: number
): number {
  if (blobs.length === 0) return 0;

  const cellWidth = canvasWidth / gridCols;
  const cellHeight = canvasHeight / gridRows;
  const gridCounts = new Array(gridCols * gridRows).fill(0);
  const totalBlobs = blobs.length;

  blobs.forEach((blob) => {
    const col = Math.floor(blob.x / cellWidth);
    const row = Math.floor(blob.y / cellHeight);
    const gridIndex = row * gridCols + col;
    if (gridIndex >= 0 && gridIndex < gridCounts.length) {
      gridCounts[gridIndex]++;
    }
  });

  let entropy = 0;
  for (let count of gridCounts) {
    if (count > 0) {
      const p = count / totalBlobs;
      entropy -= p * Math.log2(p);
    }
  }
  return entropy;
}

function LavaLamp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [entropy, setEntropy] = useState('N/A');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const ctxNonNull = ctx!;

    const blobs: LavaBlob[] = [];
    for (let i = 0; i < 10; i++) {
      blobs.push({
        x: Math.random() * 300,
        y: Math.random() * 500,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        radius: Math.random() * 20 + 10,
      });
    }

    function animate() {
      const gradient = ctxNonNull.createLinearGradient(0, 0, 0, 500);
      const time = Date.now() * 0.001;
      gradient.addColorStop(0, `hsl(${(time * 40) % 360}, 100%, 20%)`);
      gradient.addColorStop(1, `hsl(${(time * 40 + 60) % 360}, 100%, 10%)`);
      ctxNonNull.fillStyle = gradient;
      ctxNonNull.fillRect(0, 0, 300, 500);

      blobs.forEach((blob) => {
        blob.x += blob.vx;
        blob.y += blob.vy;

        if (blob.x + blob.radius > 300 || blob.x - blob.radius < 0) blob.vx *= -1;
        if (blob.y + blob.radius > 500 || blob.y - blob.radius < 0) blob.vy *= -1;
      });

      blobs.forEach((blob) => {
        const radialGradient = ctxNonNull.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, blob.radius
        );
        radialGradient.addColorStop(0, 'rgba(255, 100, 100, 0.8)');
        radialGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctxNonNull.fillStyle = radialGradient;
        ctxNonNull.beginPath();
        ctxNonNull.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctxNonNull.fill();
      });

      ctxNonNull.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctxNonNull.lineWidth = 1;
      const cols = 5;
      const rows = 8;
      const cellWidth = 300 / cols;
      const cellHeight = 500 / rows;

      for (let i = 1; i < cols; i++) {
        const x = i * cellWidth;
        ctxNonNull.beginPath();
        ctxNonNull.moveTo(x, 0);
        ctxNonNull.lineTo(x, 500);
        ctxNonNull.stroke();
      }

      for (let j = 1; j < rows; j++) {
        const y = j * cellHeight;
        ctxNonNull.beginPath();
        ctxNonNull.moveTo(0, y);
        ctxNonNull.lineTo(300, y);
        ctxNonNull.stroke();
      }

      const entropyVal = calculateSpatialEntropy(blobs, 300, 500, cols, rows);
      setEntropy(entropyVal.toFixed(4));

      requestAnimationFrame(animate);
    }

    animate();
  }, []);

  return (
    <div class="lava-section">
      <canvas ref={canvasRef} width={300} height={500}></canvas>
      <div>Entropy: {entropy}</div>
      <p id="entropy-explanation">
        Spatial entropy is calculated by dividing the lamp area into a grid (5x8). The number of blobs in each grid cell is counted. Shannon entropy (-Σ p log₂(p)) is then computed based on the probability (p) of a blob being in each cell, measuring the overall disorder or spread of the blobs.
      </p>
    </div>
  );
}

function Mandelbrot() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const ctxNonNull = ctx!;

    const width = 600;
    const height = 400;
    const maxIterations = 100;
    const iterationData: number[][] = [];

    for (let x = 0; x < width; x++) {
      iterationData[x] = [];
      for (let y = 0; y < height; y++) {
        const mappedX = (x / width) * 3.5 - 2.5;
        const mappedY = (y / height) * 2 - 1;

        let iteration = 0;
        let zx = 0;
        let zy = 0;

        while (iteration < maxIterations && (zx * zx + zy * zy) < 4) {
          const temp = zx * zx - zy * zy + mappedX;
          zy = 2 * zx * zy + mappedY;
          zx = temp;
          iteration++;
        }
        iterationData[x][y] = iteration;
      }
    }

    const startTime = performance.now();

    function drawFrame() {
      const currentTime = performance.now();
      const timeOffset = (currentTime - startTime) * 0.05;

      const imageData = ctxNonNull.createImageData(width, height);
      const data = imageData.data;

      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const iteration = iterationData[x][y];
          let r = 0, g = 0, b = 0;

          if (iteration < maxIterations) {
            const hue = (iteration * 3 + timeOffset) % 360;
            const saturation = 1;
            const lightness = 0.5;

            const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
            const x_ = c * (1 - Math.abs((hue / 60) % 2 - 1));
            const m = lightness - c / 2;

            if (hue >= 0 && hue < 60) { r = c; g = x_; b = 0; }
            else if (hue >= 60 && hue < 120) { r = x_; g = c; b = 0; }
            else if (hue >= 120 && hue < 180) { r = 0; g = c; b = x_; }
            else if (hue >= 180 && hue < 240) { r = 0; g = x_; b = c; }
            else if (hue >= 240 && hue < 300) { r = x_; g = 0; b = c; }
            else { r = c; g = 0; b = x_; }

            r = Math.round((r + m) * 255);
            g = Math.round((g + m) * 255);
            b = Math.round((b + m) * 255);
          }

          const index = (y * width + x) * 4;
          data[index] = r;
          data[index + 1] = g;
          data[index + 2] = b;
          data[index + 3] = 255;
        }
      }

      ctxNonNull.putImageData(imageData, 0, 0);
      requestAnimationFrame(drawFrame);
    }

    drawFrame();
  }, []);

  return (
    <div class="mandelbrot-section">
      <canvas ref={canvasRef} width={600} height={400}></canvas>
    </div>
  );
}

function App() {
  return (
    <div class="main-container">
      <LavaLamp />
      <Mandelbrot />
    </div>
  );
}

render(<App />, document.getElementById('app')!);