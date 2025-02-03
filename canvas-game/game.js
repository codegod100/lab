const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const FPS = 60;
const gravity = 0.5;

// Game objects
let player = {
    x: 100,
    y: 100,
    width: 50,
    height: 50,
    color: 'pink',
    velocity: {
        x: 0,
        y: 0
    }
};

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Update game objects
function update() {
    player.velocity.y += gravity;
    player.x += player.velocity.x;
    player.y += player.velocity.y;

    // Boundary checks
    if (player.x < 0) {
        player.x = 0;
        player.velocity.x = -player.velocity.x * 0.9; // Harder bounce effect with damping
    } else if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
        player.velocity.x = -player.velocity.x * 0.9; // Harder bounce effect with damping
    }

    // Simple ground collision
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.velocity.y = -player.velocity.y * 0.7; // Reduced bounce effect with damping
    }
}

// Render game objects
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Start the game loop
gameLoop();

// Handle keyboard input
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            player.velocity.x = -10; // Increased horizontal velocity
            break;
        case 'ArrowRight':
            player.velocity.x = 10; // Increased horizontal velocity
            break;
        case 'ArrowUp':
            if (player.velocity.y > -15) { // Limit the upward velocity
                player.velocity.y -= 5; // Add a smaller boost every time the up arrow is pressed
            }
            break;
        case 'ArrowDown':
            player.velocity.y = 5;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    player.velocity.x = 0;
});