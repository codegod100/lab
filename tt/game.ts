import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Interfaces and Types
interface Position {
    x: number;
    y: number;
    z: number;
}

interface ItemDefinition {
    name: string;
    width: number;
    height: number;
    stackable?: boolean;
    maxStack?: number;
    isTool?: boolean;
}

interface InventoryItem extends ItemDefinition {
    type: string; // Key from Items object
    quantity: number;
    x?: number; // Position in grid
    y?: number; // Position in grid
}

interface Backpack {
    width: number;
    height: number;
    grid: (string | boolean | null)[][]; // Stores item type key or boolean for multi-slot items
    items: InventoryItem[];
}

interface Inventory {
    tools: InventoryItem[];
    backpack: Backpack;
}

type Recipe = { [resourceType: string]: number };
type Recipes = { [itemType: string]: Recipe };

// Define a type for the Items object for better type checking
type ItemDefinitions = { [key: string]: ItemDefinition };

// Type for the UI Updater object passed around
interface UIManager {
    renderInventory: () => void;
    renderHotbar: () => void;
    updateResourceCounts: () => void;
    // Add other UI update methods as needed
}

// Forward declaration for classes used in types before definition
// declare class Player {} // Player is defined later, might not be needed if usage is ordered
// declare class Obstacle {} // Obstacle is defined later
interface Entity {
    position: Position;
    mesh?: THREE.Mesh | THREE.Group;
}

type EntityInstance = Player | Obstacle; // Concrete entity types


// Item definitions
export const Items: ItemDefinitions = {
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

const Recipes: Recipes = {
    WOODEN_AXE: { WOOD: 3 },
    WOODEN_PICKAXE: { WOOD: 3 },
    CAMPFIRE: { WOOD: 5, STONE: 3 }
};

export class World {
    player: Player | null;
    entities: Entity[];
    scene: THREE.Scene | null;

    constructor() {
        this.player = null;
        this.entities = [];
        this.scene = null;
    }

    setPlayer(player: Player): this {
        this.player = player;
        return this;
    }

    addEntity(entity: Entity): this {
        this.entities.push(entity);
        return this;
    }

    harvest(player: Player, entityIndex: number, resourceType: string, toolType: string, toolName: string): boolean {
        if (entityIndex >= 0 && entityIndex < this.entities.length) {
            const entity = this.entities[entityIndex];
            // Type guard ensures entity is Obstacle here
            if (entity instanceof Obstacle) {
                const hasTool = player.inventory.tools.some(tool =>
                    tool.name.includes(toolName)
                );
                const resourceAmount = hasTool ? 3 : 1;
                const collected = player.collectResource(resourceType, resourceAmount); // Assuming collectResource returns boolean
                if (collected) {
                    if (!hasTool) {
                        console.log(`Collected ${resourceType.toLowerCase()} (get a ${toolType} for more efficient mining)`);
                    }
                    return true;
                }

                if (entity.takeDamage(hasTool ? 2 : 1)) {
                    if (entity.mesh) {
                        entity.topple();
                    }
                    this.entities.splice(entityIndex, 1);
                    return true;
                }
            }
        }
        return false;
    }


    findNearbyResources(player: Player, radius: number = 3): { entity: Obstacle; index: number; type: string }[] {
        return this.entities
            .map((entity, index) => ({ entity, index }))
            .filter(({ entity }) =>
                entity instanceof Obstacle && // Filter for Obstacles first
                Math.sqrt(
                    Math.pow(entity.position.x - player.position.x, 2) +
                    Math.pow(entity.position.z - player.position.z, 2)
                ) <= radius
            )
            .map(({ entity, index }) => ({ entity, index, type: entity.constructor.name })) as { entity: Obstacle; index: number; type: string }[]; // Cast needed because filter doesn't change type
    }
}

export class Player {
    position: Position;
    inventory: Inventory;
    activeTool: InventoryItem | null;
    uiUpdater: UIManager | null;
    mesh?: THREE.Mesh;

    constructor(uiUpdater?: UIManager) {
        this.position = { x: 0, y: 0, z: 0 };
        this.inventory = {
            tools: [],
            backpack: {
                width: 10,
                height: 6,
                grid: Array(6).fill(null).map(() => Array(10).fill(null).slice()),
                items: []
            }
        };
        this.activeTool = null;
        this.uiUpdater = uiUpdater || null; // Assign or set to null
    }

    move(dx: number, dy: number, dz: number, world?: World): void { // world is optional
        this.position.x += dx;
        this.position.y += dy;
        this.position.z += dz;

        if (this.mesh) {
            this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        }

        if (world) {
            const nearbyResources = world.findNearbyResources(this);
            // console.log({ nearbyResources })
            if (nearbyResources.length > 0) {
                nearbyResources.forEach(({ entity, index, type }) => {
                    if (entity instanceof Obstacle) {
                        if (type === 'Tree') {
                            console.log("nearby tree")
                            world.harvest(this, index, 'WOOD', 'axe', 'Axe');
                        } else if (type === 'Stone') {
                            world.harvest(this, index, 'STONE', 'pickaxe', 'Pickaxe');
                        }
                    }
                });
            }
        }
    }

    collectResource(type: string, amount: number = 1): boolean {
        if (!Items[type]?.stackable) return false;

        const itemDefinition = Items[type];
        if (!itemDefinition?.stackable) return false; // Check definition exists

        const existing = this.inventory.backpack.items.find(
            item => item.type === type && item.quantity < (item.maxStack ?? Infinity) // Use definition's maxStack
        );

        if (existing) {
            const maxStack = existing.maxStack ?? Infinity; // Use definition's maxStack
            const spaceLeft = maxStack - existing.quantity;
            const amountToAdd = Math.min(amount, spaceLeft);
            existing.quantity += amountToAdd;
            if (this.uiUpdater) {
                this.uiUpdater.renderInventory(); // Call specific update method
                console.log('Inventory after updating stack:', JSON.stringify(this.inventory.backpack.items));
            }
            return amountToAdd > 0; // Return true if any amount was added
        } else {
            const maxStack = itemDefinition.maxStack ?? Infinity;
            const stack: InventoryItem = {
                ...itemDefinition,
                type: type,
                quantity: Math.min(amount, maxStack),
                // x and y will be set by placeItem
            };
            const position = this.findSpaceForItem(stack);
            if (!position) return false;

            const placed = this.placeItem(stack, position.x, position.y);
            if (placed && stack.isTool) {
                this.addTool(stack);
            }
            if (placed) {
                if (this.uiUpdater) {
                    this.uiUpdater.renderInventory(); // Call specific update method
                    console.log('Inventory after placing new stack:', JSON.stringify(this.inventory.backpack.items));
                }
                return true;
            }
        }
        return false;
    }

    findSpaceForItem(item: ItemDefinition): { x: number; y: number } | null {
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

    addTool(tool: InventoryItem): boolean {
        if (!tool.isTool) return false;
        console.log('Adding tool to inventory:', tool);
        this.inventory.tools.push(tool);
        console.log('Current tools:', this.inventory.tools);
        if (this.uiUpdater) {
            this.uiUpdater.renderHotbar(); // Specifically update hotbar for tools
        }
        return true;
    }

    placeItem(item: InventoryItem, x: number, y: number): boolean {
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

    removeFromGrid(item: InventoryItem): void {
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

    canCraft(itemType: string): boolean {
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

    craft(itemType: string): boolean {
        if (!this.canCraft(itemType)) {
            console.log(`Cannot craft ${itemType}: Insufficient resources.`);
            return false;
        }

        const recipe = Recipes[itemType];
        const itemDefinition = Items[itemType];
        const craftedItem: InventoryItem = {
            ...itemDefinition,
            type: itemType,
            quantity: 1 // Crafted items usually start with quantity 1
            // x, y will be set if placed
        };

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
            // Tools aren't placed in the grid currently, just added to the tools array
            // Let's try placing them in the inventory grid as well if possible
            const position = this.findSpaceForItem(craftedItem);
            if (position && this.placeItem(craftedItem, position.x, position.y)) {
                this.addTool(craftedItem); // Keep adding to tools array for hotbar logic
                if (this.uiUpdater) {
                    this.uiUpdater.renderInventory(); // Update grid and hotbar
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
                console.log(`Crafted ${itemType} successfully and placed in inventory.`);
                if (this.uiUpdater) {
                    this.uiUpdater.renderInventory(); // Update grid
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
    position: Position;
    maxHealth: number;
    currentHealth: number;
    size: number;
    mesh: THREE.Mesh | null; // Assuming THREE.Mesh is the type

    constructor(position: Position, health: number = 3, size: number = 1.0) {
        this.position = position;
        this.maxHealth = health;
        this.currentHealth = health;
        this.size = size;
        this.mesh = null;
    }

    takeDamage(amount: number): boolean {
        this.currentHealth -= amount;
        if (this.currentHealth < 0) {
            this.currentHealth = 0;
        }
        return this.currentHealth <= 0;
    }

    topple(): void {
        if (this.mesh) {
            this.mesh.rotation.z = Math.PI / 2;
            setTimeout(() => {
                if (this.mesh.parent) {
                    (this.mesh.parent as THREE.Object3D).remove(this.mesh); // Cast parent if needed
                }
            }, 1000);
        }
    }
}

export function generateResourcePositions(treeCount: number = 15, stoneCount: number = 10, areaSize: number = 40): { trees: Position[]; stones: Position[] } {
    const positions: { trees: Position[]; stones: Position[] } = { trees: [], stones: [] };
    const halfSize = areaSize / 2;

    // Generate tree positions
    for (let i = 0; i < treeCount; i++) {
        let x: number, z: number;
        const minDist = 6;
        do {
            x = (Math.random() - 0.5) * areaSize;
            z = (Math.random() - 0.5) * areaSize;
        } while (Math.abs(x) < minDist || Math.abs(z) < minDist);

        if (Math.random() > 0.7 && i > 0) {
            let refPos: Position | undefined;
            let attempts = 0;
            do {
                const refIndex = Math.floor(Math.random() * i);
                refPos = positions.trees[refIndex];
                attempts++;
            } while (refPos && // Check if refPos is defined
            (Math.abs(refPos.x) < minDist * 1.5 || Math.abs(refPos.z) < minDist * 1.5) &&
                attempts < 10);

            if (attempts < 10 && refPos) { // Check refPos again
                const offsetRange = 3;
                x = refPos.x + (Math.random() - 0.5) * offsetRange;
                z = refPos.z + (Math.random() - 0.5) * offsetRange;
            }
        }

        if (Math.abs(x) < 5) x = Math.sign(x) * 5;
        if (Math.abs(z) < 5) z = Math.sign(z) * 5;

        x = Math.max(-halfSize, Math.min(halfSize, x));
        z = Math.max(-halfSize, Math.min(halfSize, z));

        positions.trees.push({ x, y: 0, z });
    }

    // Generate stone positions
    for (let i = 0; i < stoneCount; i++) {
        let x: number, z: number;
        const minDist = 4;
        do {
            x = (Math.random() - 0.5) * areaSize;
            z = (Math.random() - 0.5) * areaSize;
        } while (Math.abs(x) < minDist || Math.abs(z) < minDist);

        if (Math.random() > 0.5 && i > 0) {
            const refIndex = Math.floor(Math.random() * i);
            const refPos: Position = positions.stones[refIndex];
            const offsetRange = 2;
            x = refPos.x + (Math.random() - 0.5) * offsetRange;
            z = refPos.z + (Math.random() - 0.5) * offsetRange;
        }

        if (Math.abs(x) < 4) x = Math.sign(x) * 4;
        if (Math.abs(z) < 4) z = Math.sign(z) * 4;

        x = Math.max(-halfSize, Math.min(halfSize, x));
        z = Math.max(-halfSize, Math.min(halfSize, z));

        positions.stones.push({ x, y: 0, z });
    }

    return positions;
}

// Make Game class available for GameUI constructor typing
export class Game {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    world: World;
    player: Player;
    gameUI: GameUI;
    uiUpdater: UIManager; // Use the interface
    keys: { [key: string]: boolean } = {}; // Track key states
    gltfLoader: GLTFLoader;
    treeModel?: THREE.Group; // To store the loaded tree model
    stoneModel?: THREE.Group; // Placeholder for stone model if needed

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 15, 20); // Initial camera position
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB); // Sky blue background
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
        directionalLight.position.set(10, 20, 15);
        directionalLight.castShadow = true;
        // Configure shadow properties for better quality if needed
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        this.scene.add(directionalLight);
        this.scene.add(directionalLight.target); // Optional: Add target for better control

        // Ground Plane
        const planeGeometry = new THREE.PlaneGeometry(100, 100);
        const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x55aa55, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI / 2;
        this.scene.add(plane);

        // World and Player Initialization
        this.world = new World();
        this.world.scene = this.scene; // Link world to the scene

        // Initialize UI Updater first
        // Note: GameUI needs 'this' (Game instance), creating a potential circular dependency if GameUI constructor needs fully initialized Game.
        // We'll define uiUpdater methods here directly referencing gameUI after it's created.
        this.uiUpdater = {
            renderInventory: () => this.gameUI?.renderInventoryGrid(), // Use optional chaining initially
            renderHotbar: () => this.gameUI?.updateHotbar(),
            updateResourceCounts: () => this.gameUI?.updateResourceCounts()
        };

        this.player = new Player(this.uiUpdater); // Pass the updater object
        this.world.setPlayer(this.player); // Add player to the world

        // Player 3D Representation (Example: a simple capsule or sphere)
        const playerGeometry = new THREE.CapsuleGeometry(0.5, 1.0, 4, 8); // Radius, height
        const playerMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red color
        const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
        playerMesh.position.set(this.player.position.x, this.player.position.y + 0.5, this.player.position.z); // Adjust y based on geometry
        playerMesh.castShadow = true;
        this.scene.add(playerMesh);
        this.player.mesh = playerMesh; // Link mesh to player data

        // Initialize GameUI after player and uiUpdater structure is ready
        this.gameUI = new GameUI(this); // Now pass the fully available 'this'

        // Now that gameUI exists, ensure uiUpdater points to the correct methods
        this.uiUpdater.renderInventory = () => this.gameUI.renderInventoryGrid();
        this.uiUpdater.renderHotbar = () => this.gameUI.updateHotbar();
        this.uiUpdater.updateResourceCounts = () => this.gameUI.updateResourceCounts();


        // Asset Loading
        // (This block is removed as loader is initialized differently in the constructor now)
        // this.loadAdssets(); // Load models

        // Initial Resource Placement (deferred until models are loaded)

        // (This block is removed as setupControls is called differently in the constructor now)
        this.update(); // Start the game loop

        // Handle window resize
        // (This block is removed as resize listener is added differently in the constructor now)
        // Initialize resources
        this.initializeResources();
    }

    initializeResources(): void {
        const resourcePositions = generateResourcePositions();

        // Create trees
        resourcePositions.trees.forEach(pos => {
            const tree = new Obstacle(pos, 3, 1.5);

            // Create simple tree geometry (trunk + leaves)
            const trunkHeight = 2;
            const trunkRadius = 0.3;
            const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius, trunkHeight, 8);
            const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.set(pos.x, trunkHeight / 2, pos.z);
            trunk.castShadow = true;

            const leavesRadius = 1.2;
            const leavesGeometry = new THREE.SphereGeometry(leavesRadius, 8, 8);
            const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.set(pos.x, trunkHeight + leavesRadius / 2, pos.z);
            leaves.castShadow = true;

            const treeMesh = new THREE.Group();
            treeMesh.add(trunk);
            treeMesh.add(leaves);

            tree.mesh = treeMesh;
            this.scene.add(treeMesh);
            this.world.addEntity(tree); // Add logical entity
        });

        // Create stones
        resourcePositions.stones.forEach(pos => {
            const stone = new Obstacle(pos, 4, 1.0);

            // Create simple stone geometry
            const stoneGeometry = new THREE.DodecahedronGeometry(0.8);
            const stoneMaterial = new THREE.MeshStandardMaterial({
                color: 0x888888,
                roughness: 0.7,
                metalness: 0.1
            });
            const stoneMesh = new THREE.Mesh(stoneGeometry, stoneMaterial);
            stoneMesh.position.set(pos.x, 0.8, pos.z);
            stoneMesh.castShadow = true;
            stoneMesh.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            stone.mesh = stoneMesh;
            this.world.scene.add(stoneMesh); // Add to scene via world
            this.world.addEntity(stone); // Add logical entity
        });

        this.setupControls();
        this.player.collectResource('WOOD', 5);
        this.player.collectResource('STONE', 2);
    }

    setupControls(): void {
        // this.keys = {}; // Already initialized in constructor
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            // Toggle inventory panel on 'E' key press
            if (e.code === 'KeyE') {
                this.gameUI.toggleInventoryPanel();
            }
        });
        window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    }

    update(): void {
        requestAnimationFrame(() => this.update());
        const moveSpeed = 0.15; // Slightly faster movement
        let dx = 0, dz = 0;
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

// Export GameUI if it needs to be accessed from elsewhere, otherwise keep as is.
export class GameUI {
    game: Game; // Reference to the main game object
    inventoryPanel: HTMLElement | null;
    inventoryGrid: HTMLElement | null;
    hotbarSlots: HTMLElement[];
    activeSlot: number;

    constructor(game: Game) {
        this.game = game;
        this.inventoryPanel = document.getElementById('inventory-crafting-panel');
        this.inventoryGrid = document.getElementById('inventory-grid');
        this.hotbarSlots = Array.from(document.querySelectorAll('.hotbar-slot'));
        this.activeSlot = 0; // Keep track of the active hotbar slot index

        this.setupHotbar();
        this.setupCraftingUI(); // This should still work as buttons are inside the panel now
        this.renderInventoryGrid(); // Initial render
        this.updateHotbar(); // Initial render
        this.updateResourceCounts(); // Initial render
    }

    setupHotbar(): void {
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

    toggleInventoryPanel(): void {
        this.inventoryPanel.classList.toggle('visible');
        // Refresh inventory when opening
        if (this.inventoryPanel.classList.contains('visible')) {
            this.renderInventoryGrid();
        }
    }

    setupCraftingUI(): void {
        // This listener now works on buttons inside the combined panel
        this.inventoryPanel.querySelectorAll('.craft-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemType = btn.dataset.item;
                // Crafting logic in Player class now calls uiUpdater methods
                this.game.player.craft(itemType);
                // No need to manually call updates here anymore,
                // Player.craft calls this.uiUpdater which points to GameUI methods
            });
        });
    }

    // New method to render the backpack grid
    renderInventoryGrid(): void {
        if (!this.inventoryGrid) return; // Guard clause
        this.inventoryGrid.innerHTML = ''; // Clear previous grid

        const player = this.game.player;
        if (!player) {
            console.error("Player not initialized yet in renderInventoryGrid");
            // Optionally clear the grid or show a message
            this.inventoryGrid.innerHTML = '<div>Player data not available</div>';
            return;
        }
        const backpack = player.inventory.backpack;
        const gridCells = Array(backpack.height).fill().map(() => Array(backpack.width).fill(null));

        // Mark occupied cells based on items array positions
        backpack.items.forEach((item: InventoryItem) => {
            if (item.x !== undefined && item.y !== undefined) {
                for (let iy = 0; iy < item.height; iy++) {
                    for (let ix = 0; ix < item.width; ix++) {
                        if (gridCells[item.y + iy] && gridCells[item.y + iy][item.x + ix] !== undefined) {
                            gridCells[item.y + iy][item.x + ix] = item; // Store reference to the item
                        }
                    }
                }
            }
        });

        // Create and append slot elements
        // Create grid cells
        for (let y = 0; y < backpack.height; y++) {


            // Add event listeners for tooltip
            const slot = document.createElement('div');
            slot.addEventListener('mouseenter', (e) => this.showTooltip(e, x, false, y));
            slot.addEventListener('mouseleave', () => this.hideTooltip());
            slot.addEventListener('mousemove', (e) => this.moveTooltip(e));


            const fragment = document.createDocumentFragment();
            fragment.appendChild(slot);
        }


        // this.inventoryGrid.appendChild(fragment);

        // Clear previous item elements before adding new ones
        this.inventoryGrid.querySelectorAll('.inventory-item').forEach(el => el.remove());

        // Place item elements
        // for (let x = 0; x < backpack.width; x++) {
        //     const slot = document.createElement('div');
        //     slot.classList.add('inventory-slot');
        //     const item = gridCells[y][x];

        //     if (item && item.y === y && item.x === x) { // Render only at the top-left corner of the item
        //         slot.textContent = item.name.split(' ')[0]; // Display short name
        //         if (item.quantity > 1) {
        //             const countSpan = document.createElement('span');
        //             countSpan.classList.add('item-count');
        //             countSpan.textContent = item.quantity;
        //             slot.appendChild(countSpan);
        //         }
        //         // Optionally add background image or color based on item type
        //         // slot.style.backgroundImage = `url(assets/${item.type.toLowerCase()}_icon.png)`;
        //         // Add data attributes for drag/drop later?
        //         slot.dataset.itemType = item.type;
        //         slot.dataset.itemX = item.x;
        //         slot.dataset.itemY = item.y;
        //     } else if (item) {
        //         // This cell is covered by a multi-cell item, maybe style differently?
        //         slot.style.backgroundColor = 'rgba(0,0,0,0.3)'; // Dimmer background
        //     }

        //     // (Grid cell creation moved above)
        // }


        this.updateResourceCounts(); // Update counts whenever inventory renders
    }


    updateHotbar(): void {
        this.hotbarSlots.forEach((slot, index) => {
            slot.innerHTML = ''; // Clear previous content
            // Assuming hotbar corresponds to the first N items in the backpack or a dedicated hotbar array?
            // Let's try linking it to the first row of the backpack for now
            const item = this.game.world.player.inventory.backpack.items.find(i => i.y === 0 && i.x === index);

            if (item) {
                slot.textContent = item.name.split(' ')[0]; // Display short name
                if (item.quantity > 1) {
                    const countSpan = document.createElement('span');
                    countSpan.classList.add('item-count');
                    countSpan.textContent = item.quantity;
                    slot.appendChild(countSpan);
                }
                // Optionally add icon
                // slot.style.backgroundImage = `url(assets/${item.type.toLowerCase()}_icon.png)`;
            }
        });
        // Ensure the active class is correctly applied
        this.hotbarSlots.forEach((slot, i) => slot.classList.toggle('active', i === this.activeSlot));
    }

    updateResourceCounts(): void {
        // This can remain as is, updating the top-left UI element
        const woodCount = this.game.player.inventory.backpack.items
            .filter(item => item.type === 'WOOD')
            .reduce((sum, item) => sum + item.quantity, 0);

        const stoneCount = this.game.player.inventory.backpack.items
            .filter(item => item.type === 'STONE')
            .reduce((sum, item) => sum + item.quantity, 0);

        const woodEl = document.getElementById('wood-count');
        const stoneEl = document.getElementById('stone-count');
        if (woodEl) woodEl.textContent = woodCount;
        if (stoneEl) stoneEl.textContent = stoneCount;
    }
}

if (typeof window !== 'undefined') {
    const game = new Game();
    window.game = game;
    game.update();
}
