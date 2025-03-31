import * as THREE from 'three';

// Item definitions
const Items = {
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
        height: 1
    },
    WOODEN_PICKAXE: {
        name: 'Wooden Pickaxe',
        width: 2,
        height: 1
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


class World {
    constructor() {
        this.player = null;
        this.entities = [];
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
                        this.scene?.remove(tree.mesh);
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
            .map((entity, index) => ({entity, index}))
            .filter(({entity}) =>
                entity instanceof Obstacle &&
                Math.sqrt(
                    Math.pow(entity.position.x - player.position.x, 2) +
                    Math.pow(entity.position.z - player.position.z, 2)
                ) <= radius
            );
    }
}

class Player {
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
        return null; // No space found
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
        // Check bounds again just in case
        if (y + item.height > backpack.height || x + item.width > backpack.width) {
            return false;
        }

        // Mark grid cells as occupied
        for (let iy = 0; iy < item.height; iy++) {
            for (let ix = 0; ix < item.width; ix++) {
                // Use a reference or identifier for the item
                backpack.grid[y + iy][x + ix] = item.type || true; 
            }
        }

        // Add item to list and store its position
        item.x = x;
        item.y = y;
        backpack.items.push(item);
        return true; // Indicate successful placement
    }

    // Helper to remove items from inventory grid
    removeFromGrid(item) {
        const backpack = this.inventory.backpack;
        if (item.x === undefined || item.y === undefined) return; // Not placed

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

    // Check if player has enough resources to craft an item
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

    // Attempt to craft an item
    craft(itemType) {
        if (!this.canCraft(itemType)) {
            console.log(`Cannot craft ${itemType}: Insufficient resources.`);
            return false;
        }

        const recipe = Recipes[itemType];
        const craftedItem = { ...Items[itemType], type: itemType };

        // Check if there's space for the crafted item
        const position = this.findSpaceForItem(craftedItem);
        if (!position) {
            console.log(`Cannot craft ${itemType}: No inventory space.`);
            return false;
        }

        // Consume resources
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

        // Place the crafted item
        if (this.placeItem(craftedItem, position.x, position.y)) {
            console.log(`Crafted ${itemType} successfully.`);
            // Explicitly add tool to inventory tools array if it's a tool
            if (craftedItem.isTool) {
                this.inventory.tools.push(craftedItem);
                console.log('Tool added to inventory:', craftedItem);
            }
            if (this.inventoryRenderer) {
                this.inventoryRenderer.render(); // Update UI
            }
            return true;
        } else {
            // This case should ideally not happen if findSpaceForItem worked,
            // but good to handle. Might need to refund resources if complex.
            console.error(`Failed to place crafted item ${itemType} even after finding space.`);
            return false;
        }
    }

} // End of Player class
class Obstacle {
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
}

function generateTreePositions(count = 20, areaSize = 40) {
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
        this.camera.position.set(0, 15, 20); // Position camera higher and back
        this.camera.lookAt(0, 0, 0); // Look at the center of the scene

        this.renderer = new THREE.WebGLRenderer({ antialias: true }); // Enable antialiasing
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB); // Sky blue background
        this.renderer.shadowMap.enabled = true; // Enable shadows
        document.body.appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Softer ambient light
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Add directional light
        directionalLight.position.set(5, 10, 7.5); // Position the light
        directionalLight.castShadow = true; // Enable shadow casting
        this.scene.add(directionalLight);

        // Ground plane
        const planeGeometry = new THREE.PlaneGeometry(100, 100);
        const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x55aa55 }); // Greener, standard material
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.receiveShadow = true; // Allow ground to receive shadows
        plane.rotation.x = -Math.PI / 2;
        this.scene.add(plane);

        this.world = new World();

        // Create a simple renderer object to link Player actions to UI updates
        // index.js will assign the actual update functions to this object later.
        this.uiUpdater = {
            render: () => {
                // This function body will be overwritten by index.js
                // to directly call its internal update functions.
                console.log("uiUpdater.render called (placeholder - waiting for index.js assignment)");
            }
        };
        this.player = new Player(this.uiUpdater); // Pass the updater to the player
        this.world.setPlayer(this.player);

        // Create player mesh (e.g., a simple capsule)
        const playerGeometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
        const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x0077ff }); // Blue color
        this.player.mesh = new THREE.Mesh(playerGeometry, playerMaterial);
        this.player.mesh.castShadow = true; // Player casts shadow
        this.player.mesh.position.set(this.player.position.x, this.player.position.y + 0.5, this.player.position.z); // Adjust y position based on geometry
        this.scene.add(this.player.mesh);

        // Generate and add trees
        const treePositions = generateTreePositions();
        treePositions.forEach(pos => {
            const tree = new Obstacle(pos, 3, 1.5); // Create logical obstacle
            // Create tree mesh (e.g., a cylinder for the trunk)
            const trunkHeight = 3;
            const trunkRadius = 0.5;
            const treeGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius, trunkHeight, 8);
            const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown color
            const treeMesh = new THREE.Mesh(treeGeometry, treeMaterial);
            treeMesh.castShadow = true; // Tree casts shadow
            treeMesh.position.set(pos.x, trunkHeight / 2, pos.z); // Position based on geometry center
            tree.mesh = treeMesh; // Link mesh to the logical obstacle
            this.scene.add(treeMesh);
            this.world.addEntity(tree); // Add logical obstacle to the world
        });

        this.setupControls(); // Initialize keyboard listeners

        // Give player starting resources for testing
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
        // Handle player movement based on keys
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

export { World, Player, Obstacle, Items, generateTreePositions, Game };

// Initialize and start the game only in a browser environment
if (typeof window !== 'undefined') {
    const game = new Game();
    window.game = game; // Expose game instance globally for UI interaction
    game.update();
}
