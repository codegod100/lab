const canvas = document.getElementById('screensaverCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const logo = new Image();
logo.src = './windows.webp'; // Actual Windows95 logo URL

const logos = [];
const numLogos = 20;

for (let i = 0; i < numLogos; i++) {
    logos.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
        scale: Math.random() * 0.5 + 0.5
    });
}

function drawLogo(logo, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.drawImage(logo, -logo.width / 2, -logo.height / 2);
    ctx.restore();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    logos.forEach((logoData) => {
        logoData.x += logoData.dx;
        logoData.y += logoData.dy;

        if (logoData.x < 0 || logoData.x > canvas.width) {
            logoData.dx = -logoData.dx;
        }

        if (logoData.y < 0 || logoData.y > canvas.height) {
            logoData.dy = -logoData.dy;
        }

        drawLogo(logo, logoData.x, logoData.y, logoData.scale, logoData.rotation);
    });

    requestAnimationFrame(animate);
}

logo.onload = animate;