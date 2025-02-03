const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const fps = 60;
const tileSize = 16;
const chunkSize = 16;
const viewportTilesX = 32;
const viewportTilesY = 24;
canvas.width = viewportTilesX * tileSize;
canvas.height = viewportTilesY * tileSize;

// Combat settings
const ATTACK_RANGE = 6 * tileSize;  // Even bigger range
const ATTACK_COOLDOWN = 30;  // Even faster attacks
let lastAttackTime = 0;
let playerHealth = 1000;
const playerDamage = 20;  // Base damage without sword
let isAttacking = false;
let attackAngle = 0;

// UI text
function drawUI() {
    ctx.font = '12px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('Controls:', 10, canvas.height - 60);
    ctx.fillText('Arrow Keys - Move', 10, canvas.height - 45);
    ctx.fillText('Space - Attack', 10, canvas.height - 30);
    ctx.fillText('Health: ' + playerHealth, 10, 20);
    ctx.fillText('Sword: ' + (hasSword ? 'Yes' : 'No'), 10, 35);
}

// Entity class for NPCs and enemies
class Entity {
    constructor(x, y, type, health, damage, hostile = false) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.health = health;
        this.damage = damage;
        this.hostile = hostile;
        this.lastMove = 0;
        this.moveDelay = 1000;
        this.color = hostile ? '#FF0000' : '#4169E1';
        this.message = hostile ? '!' : 'I will help you fight!';
        this.showMessage = false;
        this.messageTimer = 0;
        this.lastAttack = 0;
        this.attackCooldown = 800;
    }

    update(playerWorldX, playerWorldY, entities) {
        if (Date.now() - this.lastMove < this.moveDelay) return;
        
        // Find nearest enemy for friendly NPCs
        let nearestEnemy = null;
        let nearestDist = Infinity;
        
        if (!this.hostile) {
            for (const [_, entity] of entities) {
                if (entity.hostile) {
                    const dist = Math.hypot(entity.x - this.x, entity.y - this.y);
                    if (dist < nearestDist) {
                        nearestDist = dist;
                        nearestEnemy = entity;
                    }
                }
            }
        }
        
        const dx = playerWorldX - this.x;
        const dy = playerWorldY - this.y;
        const dist = Math.hypot(dx, dy);
        
        // Hide message after 1 second
        if (this.showMessage && Date.now() - this.messageTimer > 1000) {
            this.showMessage = false;
        }
        
        if (this.hostile) {
            // Only chase if within 8 tiles
            if (dist < 8 * tileSize) {
                if (Math.abs(dx) > Math.abs(dy)) {
                    this.x += Math.sign(dx) * tileSize;
                } else {
                    this.y += Math.sign(dy) * tileSize;
                }
                
                if (dist < ATTACK_RANGE) {
                    if (Date.now() - this.lastAttack > this.attackCooldown) {
                        playerHealth -= this.damage;
                        this.showMessage = true;
                        this.messageTimer = Date.now();
                        this.lastAttack = Date.now();
                        if (playerHealth <= 0) {
                            alert('Game Over! Press OK to restart.');
                            playerHealth = 100;
                            worldX = 0;
                            worldY = 0;
                        }
                    }
                }
            }
        } else {
            // Friendly NPCs help fight nearby enemies
            if (nearestEnemy && nearestDist < 8 * tileSize) {
                const enemyDx = nearestEnemy.x - this.x;
                const enemyDy = nearestEnemy.y - this.y;
                
                if (Math.abs(enemyDx) > Math.abs(enemyDy)) {
                    this.x += Math.sign(enemyDx) * tileSize;
                } else {
                    this.y += Math.sign(enemyDy) * tileSize;
                }
                
                // Add attack logic for friendly NPCs
                if (nearestDist < ATTACK_RANGE && Date.now() - this.lastAttack > this.attackCooldown) {
                    if (nearestEnemy && nearestEnemy.health > 0) {
                        // Find the actual key for this enemy in the entities Map
                        let enemyKey = null;
                        const damage = 25; // Match the damage value from spawnEntity
                        for (const [key, entity] of entities) {
                            if (entity === nearestEnemy) {
                                enemyKey = key;
                                break;
                            }
                        }
                        
                        if (nearestEnemy.takeDamage(damage)) { // Apply the increased damage
                            if (enemyKey) {
                                entities.delete(enemyKey);
                            }
                        }
                        this.showMessage = true;
                        this.message = "Take that!";
                        this.messageTimer = Date.now();
                    }
                    this.lastAttack = Date.now();
                }
                
                return;  // Skip random movement when pursuing enemy
            }
            
            // Follow player when no enemies are nearby
            if (dist > 4 * tileSize && dist < 12 * tileSize) {  // Stay between 4-12 tiles from player
                // Move towards player
                if (Math.abs(dx) > Math.abs(dy)) {
                    this.x += Math.sign(dx) * tileSize;
                } else {
                    this.y += Math.sign(dy) * tileSize;
                }
            } else if (dist < 3 * tileSize) {  // Show message when very close
                this.showMessage = true;
                this.messageTimer = Date.now();
            }
            
            // Random movement only when very close to player
            if (dist < 4 * tileSize && Math.random() < 0.3) {
                const moveRange = 2 * tileSize;
                const newX = this.x + (Math.random() - 0.5) * moveRange;
                const newY = this.y + (Math.random() - 0.5) * moveRange;
                this.x = newX;
                this.y = newY;
            }
        }
        
        this.lastMove = Date.now();
    }

    draw(screenX, screenY) {
        // Draw entity
        ctx.fillStyle = this.color;
        ctx.fillRect(screenX, screenY, tileSize, tileSize);
        
        // Draw health bar
        const healthPercent = this.health / 100;
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(screenX, screenY - 5, tileSize, 3);
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(screenX, screenY - 5, tileSize * healthPercent, 3);
        
        // Draw message bubble
        if (this.showMessage) {
            ctx.font = '12px Arial';
            ctx.fillStyle = 'white';
            ctx.fillText(this.message, screenX - 10, screenY - 10);
        }
        
        // Draw enemy indicator
        if (this.hostile) {
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.moveTo(screenX + tileSize/2, screenY - 8);
            ctx.lineTo(screenX + tileSize/2 - 4, screenY - 12);
            ctx.lineTo(screenX + tileSize/2 + 4, screenY - 12);
            ctx.fill();
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        this.showMessage = true;
        this.messageTimer = Date.now();
        return this.health <= 0;
    }
}

// Entity management
const entities = new Map();
function spawnEntity(worldX, worldY, type, hostile = false) {
    const key = `${worldX},${worldY}`;
    if (!entities.has(key)) {
        entities.set(key, new Entity(
            worldX * tileSize,
            worldY * tileSize,
            type,
            100,
            hostile ? 10 : 35, // Increased friendly NPC damage to 35
            hostile
        ));
    }
}

// Noise functions
function noise(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    return Math.sin(X * 12.9898 + Y * 78.233) * 43758.5453123 % 1;
}

function smoothNoise(x, y) {
    const corners = (noise(x-1, y-1) + noise(x+1, y-1) + noise(x-1, y+1) + noise(x+1, y+1)) / 16;
    const sides = (noise(x-1, y) + noise(x+1, y) + noise(x, y-1) + noise(x, y+1)) / 8;
    const center = noise(x, y) / 4;
    return corners + sides + center;
}

// Game state
let worldX = 0;
let worldY = 0;
const worldChunks = new Map();
const GRASS = 0;
const ROAD = 1;
const HOUSE = 2;
const SWORD = 3;
const LAKE = 4;
const CHEST = 5;
const FLOWERS = 6;
const TREES = 7;
const SHOP = 8;
const TAVERN = 9;
const TOWN_HALL = 10;
const MARKET = 11;

let hasSword = false;
const SOLID_TILES = [HOUSE, TREES, LAKE, SHOP, TAVERN, TOWN_HALL];

// Player settings
const playerSize = 16;
const playerColor = '#FFD700';
let playerX = Math.floor(viewportTilesX / 2) * tileSize;
let playerY = Math.floor(viewportTilesY / 2) * tileSize;

// Town planning functions remain the same...
function isTownCenter(worldX, worldY) {
    const townSpacing = 128;
    const x = Math.abs(worldX % townSpacing);
    const y = Math.abs(worldY % townSpacing);
    return x < 32 && y < 32;
}

function isMainRoad(worldX, worldY) {
    const townSpacing = 128;
    const roadWidth = 2;
    const x = Math.abs(worldX % townSpacing);
    const y = Math.abs(worldY % townSpacing);
    return (x < roadWidth || y < roadWidth || 
            Math.abs(x - townSpacing/2) < roadWidth || 
            Math.abs(y - townSpacing/2) < roadWidth);
}

function isNearRoad(worldX, worldY) {
    const buildingDistance = 3;
    for (let dx = -buildingDistance; dx <= buildingDistance; dx++) {
        for (let dy = -buildingDistance; dy <= buildingDistance; dy++) {
            if (isMainRoad(worldX + dx, worldY + dy)) {
                return true;
            }
        }
    }
    return false;
}

// Chunk generation
function generateChunk(chunkX, chunkY) {
    const chunk = Array(chunkSize).fill().map((_, y) =>
        Array(chunkSize).fill().map((_, x) => {
            const worldX = chunkX * chunkSize + x;
            const worldY = chunkY * chunkSize + y;
            const noiseValue = smoothNoise(worldX * 0.1, worldY * 0.1);
            
            // Reduced spawn rates
            if (Math.random() < 0.01 && !isMainRoad(worldX, worldY) && !isNearRoad(worldX, worldY)) {
                spawnEntity(worldX, worldY, 'enemy', true);
            }
            // Increased friendly NPC spawn rate in town centers
            if (isTownCenter(worldX, worldY) && Math.random() < 0.15 && isNearRoad(worldX, worldY)) {
                spawnEntity(worldX, worldY, 'villager', false);
            }
            
            // Town generation remains the same...
            if (isTownCenter(worldX, worldY)) {
                const localX = worldX % 32;
                const localY = worldY % 32;
                
                if (localX > 14 && localX < 18 && localY > 14 && localY < 18) return TOWN_HALL;
                if (localX > 12 && localX < 20 && localY > 12 && localY < 20) return MARKET;
                if ((localX === 12 || localX === 20) && localY >= 12 && localY <= 20) return SHOP;
                if ((localY === 12 || localY === 20) && localX >= 12 && localX <= 20) return SHOP;
                if ((localX === 10 || localX === 22) && (localY === 10 || localY === 22)) return TAVERN;
                if (localX >= 10 && localX <= 22 && localY >= 10 && localY <= 22) return ROAD;
            }

            if (isMainRoad(worldX, worldY)) return ROAD;
            if (isNearRoad(worldX, worldY) && noiseValue > 0.6) {
                return noiseValue > 0.8 ? TAVERN : HOUSE;
            }

            if (!isNearRoad(worldX, worldY)) {
                if (noiseValue > 0.7 && Math.hypot(worldX % 64 - 32, worldY % 64 - 32) < 10) return LAKE;
                if (noiseValue < 0.3) return TREES;
                if (noiseValue > 0.4 && noiseValue < 0.45) return FLOWERS;
            }

            if (worldX === 100 && worldY === 100) return SWORD;
            if (noiseValue > 0.75 && isNearRoad(worldX, worldY)) return CHEST;

            return GRASS;
        })
    );
    return chunk;
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw world and entities (same as before)
    const currentChunkX = Math.floor(worldX / chunkSize);
    const currentChunkY = Math.floor(worldY / chunkSize);

    // Load chunks
    for (let y = currentChunkY - 1; y <= currentChunkY + 1; y++) {
        for (let x = currentChunkX - 1; x <= currentChunkX + 1; x++) {
            const chunkKey = `${x},${y}`;
            if (!worldChunks.has(chunkKey)) {
                worldChunks.set(chunkKey, generateChunk(x, y));
            }
        }
    }

    // Draw world
    for (let y = 0; y < viewportTilesY; y++) {
        for (let x = 0; x < viewportTilesX; x++) {
            const worldTileX = x + Math.floor(worldX);
            const worldTileY = y + Math.floor(worldY);
            const chunkX = Math.floor(worldTileX / chunkSize);
            const chunkY = Math.floor(worldTileY / chunkSize);
            const chunkKey = `${chunkX},${chunkY}`;
            const chunk = worldChunks.get(chunkKey);
            
            if (chunk) {
                const tileX = ((worldTileX % chunkSize) + chunkSize) % chunkSize;
                const tileY = ((worldTileY % chunkSize) + chunkSize) % chunkSize;
                const tile = chunk[tileY][tileX];

                if (tile === SWORD) {
                    ctx.fillStyle = '#FFD700';
                    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    ctx.fillStyle = `rgba(255,255,255,${Math.abs(Math.sin(Date.now()/200))})`;
                    ctx.fillRect(x * tileSize + 4, y * tileSize + 4, 8, 8);
                } else {
                    ctx.fillStyle = tile === GRASS ? '#90EE90' :
                                  tile === ROAD ? '#8B7355' :
                                  tile === HOUSE ? '#CD853F' :
                                  tile === LAKE ? '#4169E1' :
                                  tile === CHEST ? '#FFD700' :
                                  tile === FLOWERS ? '#FF69B4' :
                                  tile === TREES ? '#228B22' :
                                  tile === SHOP ? '#DEB887' :
                                  tile === TAVERN ? '#8B4513' :
                                  tile === TOWN_HALL ? '#4A4A4A' :
                                  tile === MARKET ? '#DAA520' : '#000000';
                    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

                    // Tile details
                    if (tile === FLOWERS) {
                        ctx.fillStyle = '#FFFF00';
                        ctx.fillRect(x * tileSize + 6, y * tileSize + 6, 4, 4);
                    }
                    if (tile === TREES) {
                        ctx.fillStyle = '#006400';
                        ctx.fillRect(x * tileSize + 4, y * tileSize + 2, 8, 12);
                    }
                    if (tile === MARKET) {
                        ctx.fillStyle = '#FFD700';
                        ctx.fillRect(x * tileSize + 4, y * tileSize + 4, 2, 2);
                        ctx.fillRect(x * tileSize + 10, y * tileSize + 4, 2, 2);
                    }
                }
            }
        }
    }

    // Update and draw entities
    for (const [key, entity] of entities) {
        const screenX = entity.x - worldX * tileSize;
        const screenY = entity.y - worldY * tileSize;
        
        if (screenX >= -tileSize && screenX <= canvas.width &&
            screenY >= -tileSize && screenY <= canvas.height) {
            entity.update(playerX + worldX * tileSize, playerY + worldY * tileSize, entities);
            entity.draw(screenX, screenY);
        }
    }

    // Draw player and attack animation
    ctx.fillStyle = playerColor;
    ctx.fillRect(playerX, playerY, playerSize, playerSize);
    
    if (isAttacking) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(playerX + tileSize/2, playerY + tileSize/2, ATTACK_RANGE, 
                attackAngle - Math.PI/2, attackAngle + Math.PI/2);
        ctx.stroke();
    }
    
    // Draw player health bar
    const healthPercent = playerHealth / 100;
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(playerX, playerY - 5, tileSize, 3);
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(playerX, playerY - 5, tileSize * healthPercent, 3);

    // Draw UI
    drawUI();

    requestAnimationFrame(gameLoop);
}

gameLoop();

// Player movement and combat
document.addEventListener('keydown', (e) => {
    let newWorldX = worldX;
    let newWorldY = worldY;
    
    switch(e.key) {
        case 'ArrowUp':
            newWorldY -= 1;
            attackAngle = -Math.PI/2;
            break;
        case 'ArrowDown':
            newWorldY += 1;
            attackAngle = Math.PI/2;
            break;
        case 'ArrowLeft':
            newWorldX -= 1;
            attackAngle = Math.PI;
            break;
        case 'ArrowRight':
            newWorldX += 1;
            attackAngle = 0;
            break;
    }
    
    // Check collision with solid tiles
    if (e.key.startsWith('Arrow')) {
        const tileX = Math.floor(newWorldX);
        const tileY = Math.floor(newWorldY);
        const chunkX = Math.floor(tileX / chunkSize);
        const chunkY = Math.floor(tileY / chunkSize);
        const chunk = worldChunks.get(`${chunkX},${chunkY}`);
        
        if (chunk) {
            const localX = ((tileX % chunkSize) + chunkSize) % chunkSize;
            const localY = ((tileY % chunkSize) + chunkSize) % chunkSize;
            // Check if the coordinates are within bounds
            if (localY >= 0 && localY < chunkSize && localX >= 0 && localX < chunkSize) {
                const nextTile = chunk[localY][localX];
                // Only move if the next tile is not solid
                if (!SOLID_TILES.includes(nextTile)) {
                    worldX = newWorldX;
                    worldY = newWorldY;
                }
            }
        }
        // Call sword pickup check after movement
        checkSwordPickup();
    }
    
    switch(e.key) {
        case ' ':
            if (Date.now() - lastAttackTime > ATTACK_COOLDOWN) {
                isAttacking = true;
                setTimeout(() => isAttacking = false, 200);
                
                for (const [key, entity] of entities) {
                    const dx = entity.x - (playerX + worldX * tileSize);
                    const dy = entity.y - (playerY + worldY * tileSize);
                    if (Math.hypot(dx, dy) < ATTACK_RANGE) {
                        if (entity.takeDamage(hasSword ? playerDamage * 2 : playerDamage)) {
                            entities.delete(key);
                        }
                    }
                }
                lastAttackTime = Date.now();
            }
            break;
    }
});

// Pickup sword when player walks over it
function checkSwordPickup() {
    const tileX = Math.floor(worldX);
    const tileY = Math.floor(worldY);
    const chunk = worldChunks.get(`${Math.floor(tileX / chunkSize)},${Math.floor(tileY / chunkSize)}`);
    if (chunk && chunk[tileY % chunkSize][tileX % chunkSize] === SWORD) {
        hasSword = true;
    }
}
