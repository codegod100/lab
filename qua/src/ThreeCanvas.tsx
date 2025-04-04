/** @jsxImportSource preact */
import { FunctionalComponent } from 'preact';
import { useRef, useEffect, useState } from 'preact/hooks';

const ThreeCanvas: FunctionalComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [win, setWin] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('Canvas not found');
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('2D context not found');
      return;
    }

    const width = canvas.width;
    const height = canvas.height;

    // Static level data
    const platforms = [
      { x: 0, y: height - 20, width: 2000, height: 20 },
      { x: 100, y: height - 60, width: 100, height: 10 },
      { x: 300, y: height - 100, width: 100, height: 10 },
      { x: 500, y: height - 140, width: 100, height: 10 },
      { x: 700, y: height - 180, width: 100, height: 10 },
      { x: 900, y: height - 140, width: 100, height: 10 },
      { x: 1100, y: height - 100, width: 100, height: 10 },
      { x: 1300, y: height - 60, width: 100, height: 10 },
    ];

    const flag = { x: 1500, y: height - 100, width: 20, height: 80 };

    const star = { x: 600, y: height - 160, width: 20, height: 20, collected: false };

    const tunnels = [
      { x: 400, y: height - 60, width: 40, height: 40, targetTunnelIndex: 1 },
      { x: 800, y: height - 60, width: 40, height: 40, targetTunnelIndex: 0 },
    ];

    const enemies = [
      { x: 250, y: height - 40, width: 20, height: 20, alive: true, vx: 1, minX: 250, maxX: 350 },
      { x: 600, y: height - 120, width: 20, height: 20, alive: true, vx: 1, minX: 600, maxX: 700 },
      { x: 1000, y: height - 40, width: 20, height: 20, alive: true, vx: 1, minX: 1000, maxX: 1100 },
    ];

    const keys: Record<string, boolean> = {};

    const gravity = 0.4;
    const friction = 0.8;
    const speed = 2;
    const jumpPower = 12;

    let time = 0;

    const player = {
      x: 50,
      y: height - 60,
      width: 20,
      height: 20,
      vx: 0,
      vy: 0,
      onGround: false,
      justTeleported: false,
      invincible: false,
      invincibleTimer: 0,
    };

    const loop = () => {
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, width, height);

      time += 0.05;

      // Controls
      if (keys['a']) player.vx = -speed;
      else if (keys['d']) player.vx = speed;
      else player.vx *= friction;

      if (keys[' '] && player.onGround) {
        player.vy = -jumpPower;
        player.onGround = false;
      }

      // Physics
      player.vy += gravity;
      player.x += player.vx;
      player.y += player.vy;

      // Platform collision
      player.onGround = false;
      for (const plat of platforms) {
        if (
          player.x < plat.x + plat.width &&
          player.x + player.width > plat.x &&
          player.y < plat.y + plat.height &&
          player.y + player.height > plat.y
        ) {
          if (player.vy > 0) {
            player.y = plat.y - player.height;
            player.vy = 0;
            player.onGround = true;
          } else if (player.vy < 0) {
            player.y = plat.y + plat.height;
            player.vy = 0;
          }
        }
      }

      // Enemy AI
      for (const enemy of enemies) {
        if (!enemy.alive) continue;
        enemy.x += enemy.vx;
        if (enemy.x < enemy.minX || enemy.x + enemy.width > enemy.maxX) {
          enemy.vx *= -1;
        }
      }

      // Invincibility timer
      if (player.invincible) {
        player.invincibleTimer--;
        if (player.invincibleTimer <= 0) {
          player.invincible = false;
        }
      }

      // Star collision
      if (!star.collected &&
        player.x < star.x + star.width &&
        player.x + player.width > star.x &&
        player.y < star.y + star.height &&
        player.y + player.height > star.y
      ) {
        star.collected = true;
        player.invincible = true;
        player.invincibleTimer = 300;
      }

      // Enemy collision
      for (const enemy of enemies) {
        if (!enemy.alive) continue;
        if (
          player.x < enemy.x + enemy.width &&
          player.x + player.width > enemy.x &&
          player.y < enemy.y + enemy.height &&
          player.y + player.height > enemy.y
        ) {
          if (player.invincible) continue;
          if (player.vy > 0) {
            enemy.alive = false;
            player.vy = -jumpPower * 0.7;
          } else {
            setGameOver(true);
            return;
          }
        }
      }

      // Tunnel teleport
      let insideTunnel = false;
      for (let i = 0; i < tunnels.length; i++) {
        const tunnel = tunnels[i];
        if (
          player.x < tunnel.x + tunnel.width &&
          player.x + player.width > tunnel.x &&
          player.y < tunnel.y + tunnel.height &&
          player.y + player.height > tunnel.y
        ) {
          insideTunnel = true;
          if (!player.justTeleported) {
            const targetTunnel = tunnels[tunnel.targetTunnelIndex];
            player.x = targetTunnel.x + targetTunnel.width + 5;
            player.y = targetTunnel.y;
            player.justTeleported = true;
          }
        }
      }
      if (!insideTunnel) {
        player.justTeleported = false;
      }

      // Win condition
      if (
        player.x < flag.x + flag.width &&
        player.x + player.width > flag.x &&
        player.y < flag.y + flag.height &&
        player.y + player.height > flag.y
      ) {
        setWin(true);
        return;
      }

      // Camera
      let cameraX = player.x - width / 2 + player.width / 2;
      cameraX = Math.max(0, cameraX);

      // Draw platforms
      ctx.fillStyle = '#654321';
      for (const plat of platforms) {
        ctx.fillRect(plat.x - cameraX, plat.y, plat.width, plat.height);
      }

      // Draw tunnels
      for (const tunnel of tunnels) {
        ctx.fillStyle = 'red';
        ctx.fillRect(tunnel.x - cameraX, tunnel.y - tunnel.height, tunnel.width, tunnel.height);
        const peekY = Math.sin(time + tunnel.x) * 5;
        ctx.fillStyle = 'purple';
        ctx.fillRect(tunnel.x - cameraX + 10, tunnel.y - 10 + peekY, 20, 20);
      }

      // Draw flag
      ctx.fillStyle = 'red';
      ctx.fillRect(flag.x - cameraX, flag.y, flag.width, flag.height);

      // Draw star
      if (!star.collected) {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(star.x - cameraX, star.y, star.width, star.height);
      }

      // Draw enemies
      ctx.fillStyle = 'green';
      for (const enemy of enemies) {
        if (enemy.alive) {
          ctx.fillRect(enemy.x - cameraX, enemy.y, enemy.width, enemy.height);
        }
      }

      // Draw player
      ctx.fillStyle = 'blue';
      ctx.fillRect(player.x - cameraX, player.y, player.width, player.height);

      // Invincibility overlay
      if (player.invincible) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.fillRect(player.x - cameraX, player.y, player.width, player.height);
      }

      if (!win && !gameOver) requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);

    const keyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
    };
    const keyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
    };
  }, [resetKey]);

  const resetGame = () => {
    setWin(false);
    setGameOver(false);
    setResetKey(k => k + 1);
  };

  return (
    <div class="border border-red-500 border-4 relative" style={{ width: '300px', height: '300px', backgroundColor: '#ccc' }}>
      {(win || gameOver) && (
        <div class="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-white text-xl font-bold space-y-4">
          {win ? 'You Win!' : 'Game Over'}
          <button class="btn btn-primary" onClick={resetGame}>Reset</button>
        </div>
      )}
      <canvas ref={canvasRef} width={300} height={300} style={{ backgroundColor: '#fff', border: '2px solid blue' }} />
    </div>
  );
};

export default ThreeCanvas;