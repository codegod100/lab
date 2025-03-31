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