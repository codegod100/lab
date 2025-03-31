// game.js

/**
 * @typedef {Object} InventoryItem
 * @property {string} type
 * @property {string} name
 * @property {number} width
 * @property {number} height
 * @property {number} [x]
 * @property {number} [y]
 */

/**
 * @typedef {Object} StackableItem
 * @property {true} stackable
 * @property {number} quantity
 * @property {number} maxStack
 * @extends InventoryItem
 */

/**
 * @typedef {Object} ToolItem
 * @property {false} [stackable]
 * @extends InventoryItem
 */

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

class World {
    constructor() {
        this.player = null;
        this.entities = []; // To hold obstacles, NPCs, etc.
    }

    setPlayer(player) {
        this.player = player;
        // Optionally add player's mesh to the scene here if World manages THREE objects
    }

    addEntity(entity) {
        this.entities.push(entity);
        // Optionally add entity's mesh to the scene here
    }

    harvestTree(player, treeIndex) {
        if (treeIndex >= 0 && treeIndex < this.entities.length) {
            const tree = this.entities[treeIndex];
            if (tree instanceof Obstacle) {
                // Give wood on each hit (using new inventory system)
                player.collectResource('WOOD', 2);
                
                if (tree.takeDamage(1)) {
                    // Tree was destroyed
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
    constructor() {
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
    }

    move(dx, dy, dz) {
        this.position.x += dx;
        this.position.y += dy;
        this.position.z += dz;
    }

    collectResource(type, amount = 1) {
        if (!Items[type]?.stackable) return false;
        
        const existing = this.inventory.backpack.items.find(
            item => item.type === type && item.quantity < item.maxStack
        );
        
        if (existing) {
            existing.quantity = Math.min(existing.quantity + amount, existing.maxStack);
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
            
            if (this.placeItem(stack, position.x, position.y)) {
                return true;
            }
        }
        return false;
    }

    craft(item) {
        const recipes = {
            'WOODEN_AXE': { WOOD: 3 },
            'WOODEN_PICKAXE': { WOOD: 3 },
            'CAMPFIRE': { WOOD: 5, STONE: 3 }
        };

        if (!recipes[item]) return false;

        for (const [material, needed] of Object.entries(recipes[item])) {
            let remaining = needed;
            const stacks = this.inventory.backpack.items
                .filter(i => i.type === material)
                .sort((a, b) => b.quantity - a.quantity);
            
            if (stacks.reduce((sum, stack) => sum + stack.quantity, 0) < remaining) {
                return false;
            }
        }

        for (const [material, needed] of Object.entries(recipes[item])) {
            let remaining = needed;
            const stacks = this.inventory.backpack.items
                .filter(i => i.type === material)
                .sort((a, b) => b.quantity - a.quantity);
            
            for (const stack of stacks) {
                if (remaining <= 0) break;
                const deduct = Math.min(remaining, stack.quantity);
                stack.quantity -= deduct;
                remaining -= deduct;
                
                if (stack.quantity === 0) {
                    this.removeItem(stack);
                }
            }
        }
        
        const craftedItem = {
            ...Items[item],
            type: item.toLowerCase(),
            x: -1,
            y: -1
        };

        const isTool = craftedItem.type.includes('axe') || craftedItem.type.includes('pickaxe');
        if (!isTool) {
            const position = this.findSpaceForItem(craftedItem);
            if (!position) return false;
            
            if (!this.placeItem(craftedItem, position.x, position.y)) {
                return false;
            }
        } else {
            this.inventory.tools.push(craftedItem);
        }
        
        return true;
    }

    hasTool(toolType) {
        return this.inventory.tools.includes(toolType);
    }

    canPlaceItem(item, x, y) {
        const backpack = this.inventory.backpack;
        if (x < 0 || y < 0 ||
            x + item.width > backpack.width ||
            y + item.height > backpack.height) {
            return false;
        }

        for (let iy = y; iy < y + item.height; iy++) {
            for (let ix = x; ix < x + item.width; ix++) {
                if (backpack.grid[iy][ix] !== null) {
                    return false;
                }
            }
        }
        return true;
    }

    placeItem(item, x, y) {
        if (!this.canPlaceItem(item, x, y)) return false;

        const backpack = this.inventory.backpack;
        item.x = x;
        item.y = y;
        backpack.items.push(item);

        for (let iy = y; iy < y + item.height; iy++) {
            for (let ix = x; ix < x + item.width; ix++) {
                backpack.grid[iy][ix] = item;
            }
        }
        return true;
    }

    removeItem(item) {
        const backpack = this.inventory.backpack;
        const index = backpack.items.indexOf(item);
        if (index === -1) return false;

        for (let iy = item.y; iy < item.y + item.height; iy++) {
            for (let ix = item.x; ix < item.x + item.width; ix++) {
                backpack.grid[iy][ix] = null;
            }
        }
        backpack.items.splice(index, 1);
        return true;
    }

    findSpaceForItem(item) {
        const backpack = this.inventory.backpack;
        for (let y = 0; y <= backpack.height - item.height; y++) {
            for (let x = 0; x <= backpack.width - item.width; x++) {
                if (this.canPlaceItem(item, x, y)) {
                    return {x, y};
                }
            }
        }
        return null;
    }
}

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
        console.log(`Obstacle took ${amount} damage, health: ${this.currentHealth}/${this.maxHealth}`);
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

// ES Module Exports
export { World, Player, Obstacle, Items, generateTreePositions };
