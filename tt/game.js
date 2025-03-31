import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Item definitions
export const Items = {
    WOOD: {
        name: 'Wood',
        width: 1,
        height: 1,
        stackable: true,
        maxStack: 20
    },
    STONE: {
        name: 'Stone',
        width: 1,
        height: 1,
        stackable: true,
        maxStack: 20
    },
    WOODEN_AXE: {
        name: 'Wooden Axe',
        width: 2,
        height: 1,
        isTool: true
    },
    WOODEN_PICKAXE: {
        name: 'Wooden Pickaxe',
        width: 2,
        height: 1,
        isTool: true
    },
    CAMPFIRE: {
        name: 'Campfire',
        width: 2,
        height: 2
    }
};

const Recipes = {
    WOODEN_AXE: { WOOD: 3 },
    WOODEN_PICKAXE: { WOOD: 3 },
    CAMPFIRE: { WOOD: 5, STONE: 3 }
};

export class World {
    constructor() {
        this.player = null;
        this.entities = [];
        this.scene = null;
    }

    setPlayer(player) {
        this.player = player;
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    harvestTree(player, treeIndex) {
        if (treeIndex >= 0 && treeIndex < this.entities.length) {
            const tree = this.entities[treeIndex];
            if (tree instanceof Obstacle) {
                const hasAxe = player.inventory.tools.some(tool =>
                    tool.name.includes('Axe')
                );
                const woodAmount = hasAxe ? 3 : 1;
                const collected = player.collectResource('WOOD', woodAmount);
                if (collected) {
                    if (!hasAxe) {
                        console.log("Collected wood (get an axe for more efficient chopping)");
                    }
                    return true;
                }
                
                if (tree.takeDamage(hasAxe ? 2 : 1)) {
                    if (tree.mesh) {
                        tree.topple();
                    }
                    this.entities.splice(treeIndex, 1);
                    return true;
                }
            }
        }
        return false;
    }

    findNearbyTrees(player, radius = 3) {
        return this.entities
            .map((entity, index) => ({ entity, index }))
            .filter(({ entity }) =>
                entity instanceof Obstacle &&
                Math.sqrt(
                    Math.pow(entity.position.x - player.position.x, 2) +
                    Math.pow(entity.position.z - player.position.z, 2)
                ) <= radius
            );
    }
}

export class Player {
    constructor(inventoryRenderer) {
        this.position = { x: 0, y: 0, z: 0 };
        this.inventory = {
            tools: [],
            backpack: {
                width: 10,
                height: 6,
                grid: Array(6).fill().map(() => Array(10).fill(null)),
                items: []
            }
        };
        this.activeTool = null;
        this.inventoryRenderer = inventoryRenderer;
    }

    move(dx, dy, dz, world) {
        this.position.x += dx;
        this.position.y += dy;
        this.position.z += dz;
        
        if (this.mesh) {
            this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        }

        if (world) {
            const nearbyTrees = world.findNearbyTrees(this);
            if (nearbyTrees.length > 0) {
                world.harvestTree(this, nearbyTrees[0].index);
            }
        }
    }

    collectResource(type, amount = 1) {
        if (!Items[type]?.stackable) return false;
        
        const existing = this.inventory.backpack.items.find(
            item => item.type === type && item.quantity < item.maxStack
        );
        
        if (existing) {
            existing.quantity = Math.min(existing.quantity + amount, existing.maxStack);
            if (this.inventoryRenderer) {
                this.inventoryRenderer.render();
                console.log('Inventory after updating stack:', JSON.stringify(this.inventory.backpack.items));
            }
            return true;
        } else {
            const stack = {
                ...Items[type],
                type: type,
                quantity: Math.min(amount, Items[type].maxStack),
                x: -1,
                y: -1
            };
            const position = this.findSpaceForItem(stack);
            if (!position) return false;
            
            const placed = this.placeItem(stack, position.x, position.y);
            if (placed && stack.isTool) {
                this.addTool(stack);
            }
            if (placed) {
                if (this.inventoryRenderer) {
                    this.inventoryRenderer.render();
                    console.log('Inventory after placing new stack:', JSON.stringify(this.inventory.backpack.items));
                }
                return true;
            }
        }
        return false;
    }

    findSpaceForItem(item) {
        const backpack = this.inventory.backpack;
        for (let y = 0; y <= backpack.height - item.height; y++) {
            for (let x = 0; x <= backpack.width - item.width; x++) {
                let canPlace = true;
                for (let iy = 0; iy < item.height; iy++) {
                    for (let ix = 0; ix < item.width; ix++) {
                        if (backpack.grid[y + iy][x + ix] !== null) {
                            canPlace = false;
                            break;
                        }
                    }
                    if (!canPlace) break;
                }
                if (canPlace) {
                    return { x, y };
                }
            }
        }
        return null;
    }

    addTool(tool) {
        if (!tool.isTool) return false;
        console.log('Adding tool to inventory:', tool);
        this.inventory.tools.push(tool);
        console.log('Current tools:', this.inventory.tools);
        if (this.inventoryRenderer) {
            this.inventoryRenderer.render();
        }
        return true;
    }

    placeItem(item, x, y) {
        const backpack = this.inventory.backpack;
        if (y + item.height > backpack.height || x + item.width > backpack.width) {
            return false;
        }

        for (let iy = 0; iy < item.height; iy++) {
            for (let ix = 0; ix < item.width; ix++) {
                backpack.grid[y + iy][x + ix] = item.type || true; 
            }
        }

        item.x = x;
        item.y = y;
        backpack.items.push(item);
        return true;
    }

    removeFromGrid(item) {
        const backpack = this.inventory.backpack;
        if (item.x === undefined || item.y === undefined) return;

        for (let iy = 0; iy < item.height; iy++) {
            for (let ix = 0; ix < item.width; ix++) {
                if (backpack.grid[item.y + iy]?.[item.x + ix] === item.type) {
                    backpack.grid[item.y + iy][item.x + ix] = null;
                }
            }
        }
        item.x = undefined;
        item.y = undefined;
    }

    canCraft(itemType) {
        const recipe = Recipes[itemType];
        if (!recipe) return false;

        for (const resourceType in recipe) {
            const requiredAmount = recipe[resourceType];
            let currentAmount = 0;
            this.inventory.backpack.items.forEach(item => {
                if (item.type === resourceType) {
                    currentAmount += item.quantity;
                }
            });
            if (currentAmount < requiredAmount) {
                return false;
            }
        }
        return true;
    }

    craft(itemType) {
        if (!this.canCraft(itemType)) {
            console.log(`Cannot craft ${itemType}: Insufficient resources.`);
            return false;
        }
    
        const recipe = Recipes[itemType];
        const craftedItem = { ...Items[itemType], type: itemType };
    
        for (const resourceType in recipe) {
            let amountToConsume = recipe[resourceType];
            for (let i = this.inventory.backpack.items.length - 1; i >= 0 && amountToConsume > 0; i--) {
                const item = this.inventory.backpack.items[i];
                if (item.type === resourceType) {
                    const consume = Math.min(amountToConsume, item.quantity);
                    item.quantity -= consume;
                    amountToConsume -= consume;
                    if (item.quantity <= 0) {
                        this.removeFromGrid(item);
                        this.inventory.backpack.items.splice(i, 1);
                    }
                }
            }
        }
    
        if (craftedItem.isTool) {
            if (this.addTool(craftedItem)) {
                if (this.inventoryRenderer) {
                    this.inventoryRenderer.render();
                }
                console.log(`Crafted ${itemType} successfully as a tool.`);
                return true;
            } else {
                console.error(`Failed to add crafted tool ${itemType} to inventory.`);
                return false;
            }
        } else {
            const position = this.findSpaceForItem(craftedItem);
            if (!position) {
                console.log(`Cannot craft ${itemType}: No inventory space.`);
                return false;
            }
            if (this.placeItem(craftedItem, position.x, position.y)) {
                console.log(`Crafted ${itemType} successfully.`);
                if (this.inventoryRenderer) {
                    this.inventoryRenderer.render();
                }
                return true;
            } else {
                console.error(`Failed to place crafted item ${itemType} even after finding space.`);
                return false;
            }
        }
    }
}

export class Obstacle {
    constructor(position, health = 3, size = 1.0) {
        this.position = position;
        this.maxHealth = health;
        this.currentHealth = health;
        this.size = size;
        this.mesh = null;
    }

    takeDamage(amount) {
        this.currentHealth -= amount;
        if (this.currentHealth < 0) {
            this.currentHealth = 0;
        }
        return this.currentHealth <= 0;
    }
    
    topple() {
        if (this.mesh) {
            this.mesh.rotation.z = Math.PI / 2;
            setTimeout(() => {
                if (this.mesh.parent) {
                    this.mesh.parent.remove(this.mesh);
                }
            }, 1000);
        }
    }
}

export function generateTreePositions(count = 20, areaSize = 40) {
    const positions = [];
    const halfSize = areaSize / 2;

    for (let i = 0; i < count; i++) {
        let x, z;
        const minDist = 6;
        do {
            x = (Math.random() - 0.5) * areaSize;
            z = (Math.random() - 0.5) * areaSize;
        } while (Math.abs(x) < minDist || Math.abs(z) < minDist);

        if (Math.random() > 0.7 && i > 0) {
            let refPos;
            let attempts = 0;
            do {
                const refIndex = Math.floor(Math.random() * i);
                refPos = positions[refIndex];
                attempts++;
            } while ((Math.abs(refPos.x) < minDist * 1.5 ||
                     Math.abs(refPos.z) < minDist * 1.5) &&
                    attempts < 10);

            if (attempts < 10) {
                const offsetRange = 3;
                x = refPos.x + (Math.random() - 0.5) * offsetRange;
                z = refPos.z + (Math.random() - 0.5) * offsetRange;
            }
        }

        if (Math.abs(x) < 5) x = Math.sign(x) * 5;
        if (Math.abs(z) < 5) z = Math.sign(z) * 5;

        x = Math.max(-halfSize, Math.min(halfSize, x));
        z = Math.max(-halfSize, Math.min(halfSize, z));

        positions.push({ x, y: 0, z });
    }

    return positions;
}

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 15, 20);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        const planeGeometry = new THREE.PlaneGeometry(100, 100);
        const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x55aa55 });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI / 2;
        this.scene.add(plane);

        this.world = new World();
        this.world.scene = this.scene;

        this.gameUI = new GameUI(this);
        this.uiUpdater = {
            render: () => this.gameUI.updateResourceCounts()
        };
        
        this.player = new Player(this.uiUpdater);
        this.world.setPlayer(this.player);

        const playerGeometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
        const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x0077ff });
        this.player.mesh = new THREE.Mesh(playerGeometry, playerMaterial);
        this.player.mesh.castShadow = true;
        this.player.mesh.position.set(this.player.position.x, this.player.position.y + 0.5, this.player.position.z);
        this.scene.add(this.player.mesh);

        const treePositions = generateTreePositions();
        treePositions.forEach(pos => {
            const tree = new Obstacle(pos, 3, 1.5);
            
            // Create simple tree geometry (trunk + leaves)
            const trunkHeight = 2;
            const trunkRadius = 0.3;
            const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius, trunkHeight, 8);
            const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.set(pos.x, trunkHeight/2, pos.z);
            trunk.castShadow = true;
            
            const leavesRadius = 1.2;
            const leavesGeometry = new THREE.SphereGeometry(leavesRadius, 8, 8);
            const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.set(pos.x, trunkHeight + leavesRadius/2, pos.z);
            leaves.castShadow = true;
            
            const treeMesh = new THREE.Group();
            treeMesh.add(trunk);
            treeMesh.add(leaves);
            
            tree.mesh = treeMesh;
            this.scene.add(treeMesh);
            this.world.addEntity(tree);
        });

        this.setupControls();
        this.player.collectResource('WOOD', 5);
        this.player.collectResource('STONE', 2);
    }

    setupControls() {
        this.keys = {};
        window.addEventListener('keydown', (e) => { this.keys[e.code] = true; });
        window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    }

    update() {
        requestAnimationFrame(() => this.update());
        const moveSpeed = 0.1;
        if (this.keys?.KeyW) {
            this.player.move(0, 0, -moveSpeed, this.world);
        }
        if (this.keys?.KeyS) {
            this.player.move(0, 0, moveSpeed, this.world);
        }
        if (this.keys?.KeyA) {
            this.player.move(-moveSpeed, 0, 0, this.world);
        }
        if (this.keys?.KeyD) {
            this.player.move(moveSpeed, 0, 0, this.world);
        }
        this.renderer.render(this.scene, this.camera);
    }
}

class GameUI {
    constructor(game) {
        this.game = game;
        this.setupHotbar();
        this.setupCraftingUI();
    }

    setupHotbar() {
        this.hotbarSlots = Array.from(document.querySelectorAll('.hotbar-slot'));
        this.activeSlot = 0;
        this.hotbarSlots[this.activeSlot].classList.add('active');
        
        window.addEventListener('keydown', (e) => {
            if (e.code.startsWith('Digit') && parseInt(e.code[5]) >= 1 && parseInt(e.code[5]) <= 9) {
                this.hotbarSlots[this.activeSlot].classList.remove('active');
                this.activeSlot = parseInt(e.code[5]) - 1;
                this.hotbarSlots[this.activeSlot].classList.add('active');
            }
        });
    }

    setupCraftingUI() {
        document.querySelectorAll('.craft-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemType = btn.dataset.item;
                if (this.game.player.craft(itemType)) {
                    this.game.uiUpdater.render();
                    this.updateHotbar();
                }
            });
        });
    }

    updateHotbar() {
        this.hotbarSlots.forEach((slot, index) => {
            slot.innerHTML = '';
            const tool = this.game.player.inventory.tools[index];
            if (tool) {
                const toolName = document.createElement('div');
                toolName.textContent = tool.name.split(' ')[0];
                toolName.style.fontSize = '10px';
                toolName.style.textAlign = 'center';
                slot.appendChild(toolName);
            }
        });
    }

    updateResourceCounts() {
        const woodCount = this.game.player.inventory.backpack.items
            .filter(item => item.type === 'WOOD')
            .reduce((sum, item) => sum + item.quantity, 0);
        
        const stoneCount = this.game.player.inventory.backpack.items
            .filter(item => item.type === 'STONE')
            .reduce((sum, item) => sum + item.quantity, 0);

        document.getElementById('wood-count').textContent = woodCount;
        document.getElementById('stone-count').textContent = stoneCount;
    }
}

if (typeof window !== 'undefined') {
    const game = new Game();
    window.game = game;
    game.update();
}
