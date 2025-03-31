import { World, Player, Obstacle, Items, generateTreePositions } from './game.js';

describe('World', () => {
    let world;

    beforeEach(() => {
        world = new World();
    });

    it('should create a new world', () => {
        expect(world).toBeInstanceOf(World);
        expect(world.entities).toEqual([]);
    });

    it('should add an entity', () => {
        const entity = new Obstacle({ x: 0, y: 0, z: 0 });
        world.addEntity(entity);
        expect(world.entities.length).toBe(1);
    });
});

describe('Player', () => {
    let player;

    beforeEach(() => {
        player = new Player(null);
    });

    it('should create a new player', () => {
        expect(player).toBeInstanceOf(Player);
        expect(player.position).toEqual({ x: 0, y: 0, z: 0 });
    });

    it('should move the player', () => {
        player.move(1, 0, 0, null);
        expect(player.position.x).toBe(1);
    });

    it('should collect resources', () => {
        const collected = player.collectResource('WOOD', 2);
        expect(collected).toBe(true);
    });
});

describe('Obstacle', () => {
    let obstacle;

    beforeEach(() => {
        obstacle = new Obstacle({ x: 0, y: 0, z: 0 });
    });

    it('should create a new obstacle', () => {
        expect(obstacle).toBeInstanceOf(Obstacle);
        expect(obstacle.position).toEqual({ x: 0, y: 0, z: 0 });
    });

    it('should handle damage', () => {
        const isDestroyed = obstacle.takeDamage(3);
        expect(isDestroyed).toBe(true);
    });
});

describe('generateTreePositions', () => {
    it('should generate tree positions', () => {
        const positions = generateTreePositions();
        expect(positions.length).toBe(20);
    });
});
describe('Tool management', () => {
    let player;
    beforeEach(() => {
        player = new Player(null);
    });
    it('should add a tool via addTool method without adding to backpack items', () => {
        const tool = { ...Items.WOODEN_AXE, type: 'WOODEN_AXE' };
        const added = player.addTool(tool);
        expect(added).toBe(true);
        const toolInTools = player.inventory.tools.find(t => t.type === 'WOODEN_AXE');
        expect(toolInTools).toBeDefined();
        const toolInBackpack = player.inventory.backpack.items.find(item => item.type === 'WOODEN_AXE');
        expect(toolInBackpack).toBeUndefined();
    });
});
describe('Crafting', () => {
    let player;
    beforeEach(() => {
        player = new Player(null);
        // Add wood resources needed for crafting a wooden axe (Recipe requires 3 wood)
        player.collectResource('WOOD', 5);
    });
    
    it('should craft a wooden axe and store it in tools, not in backpack items', () => {
        const crafted = player.craft('WOODEN_AXE');
        expect(crafted).toBe(true);
        const axeInTools = player.inventory.tools.find(tool => tool.type === 'WOODEN_AXE');
        expect(axeInTools).toBeDefined();
        const axeInBackpack = player.inventory.backpack.items.find(item => item.type === 'WOODEN_AXE');
        expect(axeInBackpack).toBeUndefined();
    });
});