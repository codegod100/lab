/** @jsxImportSource preact */
import { FunctionalComponent } from 'preact';
import { useRef, useEffect } from 'preact/hooks';

const PongGame: FunctionalComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ball properties
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    const ballSize = 10;
    let ballVX = 2;
    let ballVY = 2;

    // Paddle properties
    const paddleWidth = 10;
    const paddleHeight = 50;
    let leftPaddleY = canvas.height / 2 - paddleHeight / 2;
    let rightPaddleY = canvas.height / 2 - paddleHeight / 2;
    const paddleSpeed = 4;

    let prevLeftPaddleY = leftPaddleY;
    let prevRightPaddleY = rightPaddleY;

    // Scores
    let leftScore = 0;
    let rightScore = 0;

    let color = 'blue';

    // Change color periodically based on theme
    const colorInterval = setInterval(() => {
      const theme = document.documentElement.getAttribute('data-theme') || 'light';
      if (theme === 'dark') {
        color = `hsl(${Math.floor(Math.random() * 360)}, 80%, 60%)`;
      } else {
        color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 40%)`;
      }
    }, 1000);

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const beep = () => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
      oscillator.stop(audioCtx.currentTime + 0.3);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw scores
      ctx.fillStyle = '#333';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${leftScore} : ${rightScore}`, canvas.width / 2, 20);

      // Draw paddles
      ctx.fillStyle = '#888';
      ctx.fillRect(0, leftPaddleY, paddleWidth, paddleHeight);
      ctx.fillRect(canvas.width - paddleWidth, rightPaddleY, paddleWidth, paddleHeight);

      // Draw ball
      ctx.fillStyle = color;
      ctx.fillRect(ballX, ballY, ballSize, ballSize);
    };

    const update = () => {
      // Paddle AI with smoothing
      const leftCenter = leftPaddleY + paddleHeight / 2;
      const rightCenter = rightPaddleY + paddleHeight / 2;

      leftPaddleY += (ballY - leftCenter) * 0.1;
      rightPaddleY += (ballY - rightCenter) * 0.1;

      // Clamp paddles
      leftPaddleY = Math.max(0, Math.min(canvas.height - paddleHeight, leftPaddleY));
      rightPaddleY = Math.max(0, Math.min(canvas.height - paddleHeight, rightPaddleY));

      // Move ball
      ballX += ballVX;
      ballY += ballVY;

      // Check if ball exits top or bottom, count as score
      if (ballY <= 0) {
        if (ballVX > 0) leftScore++;
        else rightScore++;
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballVX = 2 * (Math.random() > 0.5 ? 1 : -1);
        ballVY = (Math.random() - 0.5);
        beep();
        return;
      } else if (ballY + ballSize >= canvas.height) {
        if (ballVX > 0) leftScore++;
        else rightScore++;
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballVX = 2 * (Math.random() > 0.5 ? 1 : -1);
        ballVY = (Math.random() - 0.5);
        beep();
        return;
      }

      // Bounce off paddles with spin and randomness
      if (
        (ballX <= paddleWidth &&
          ballY + ballSize >= leftPaddleY &&
          ballY <= leftPaddleY + paddleHeight)
      ) {
        ballVX *= -1;
        const paddleCenter = leftPaddleY + paddleHeight / 2;
        const ballCenter = ballY + ballSize / 2;
        const offset = (ballCenter - paddleCenter) / (paddleHeight / 2);
        ballVY = offset * 1 + (Math.random() - 0.5) * 1.0;
        const paddleVelocity = leftPaddleY - prevLeftPaddleY;
        ballVY += paddleVelocity * 0.5;
        beep();
      } else if (
        (ballX + ballSize >= canvas.width - paddleWidth &&
          ballY + ballSize >= rightPaddleY &&
          ballY <= rightPaddleY + paddleHeight)
      ) {
        ballVX *= -1;
        const paddleCenter = rightPaddleY + paddleHeight / 2;
        const ballCenter = ballY + ballSize / 2;
        const offset = (ballCenter - paddleCenter) / (paddleHeight / 2);
        ballVY = offset * 1 + (Math.random() - 0.5) * 1.0;
        const paddleVelocity = rightPaddleY - prevRightPaddleY;
        ballVY += paddleVelocity * 0.5;
        beep();
      }

      // Score update and reset ball if it goes past paddles horizontally
      if (ballX < 0) {
        rightScore++;
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballVX = 2 * (Math.random() > 0.5 ? 1 : -1);
        ballVY = (Math.random() - 0.5);
      } else if (ballX > canvas.width) {
        leftScore++;
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballVX = 2 * (Math.random() > 0.5 ? 1 : -1);
        ballVY = (Math.random() - 0.5);
      }

      // Save paddle positions for next frame
      prevLeftPaddleY = leftPaddleY;
      prevRightPaddleY = rightPaddleY;
    };

    const loop = () => {
      update();
      draw();
      requestAnimationFrame(loop);
    };

    loop();

    return () => {
      clearInterval(colorInterval);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={300}
      class="border border-gray-400 rounded"
    ></canvas>
  );
};

export default PongGame;