// game.js

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

    // update(deltaTime) {
    //     // Game logic updates for player and entities would go here
    //     if (this.player) {
    //         // Update player logic
    //     }
    //     this.entities.forEach(entity => {
    //         // Update entity logic
    //     });
    // }
}

class Player {
    constructor() {
        this.position = { x: 0, y: 0, z: 0 };
        // Future RPG stats: hp, mp, strength, etc.
        // this.mesh = null; // Optional reference to the THREE.Mesh
    }

    // Methods for actions: move, attack, interact, etc.
    move(dx, dy, dz) {
        this.position.x += dx;
        this.position.y += dy;
        this.position.z += dz;
    }
}

// Could be renamed to Entity or have a base Entity class
class Obstacle {
    constructor(position, health = 3) { // Default health to 3 hits
        this.position = position;
        this.maxHealth = health;
        this.currentHealth = health;
        this.mesh = null; // Reference to the THREE.Mesh
    }

    takeDamage(amount) {
        this.currentHealth -= amount;
        if (this.currentHealth < 0) {
            this.currentHealth = 0;
        }
        console.log(`Obstacle took ${amount} damage, health: ${this.currentHealth}/${this.maxHealth}`);
        return this.currentHealth <= 0; // Return true if destroyed
    }
}

// Export using ES Modules
export { World, Player, Obstacle };