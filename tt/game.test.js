// Import necessary modules
import { World, Player, Obstacle, generateTreePositions } from './game.js'; // Using ESM import

// Mock Three.js Vector3 if needed for testing environment, or ensure Jest handles it
// For now, let's assume a simple position object/array for the test

describe('Player', () => {
    test('should be created with an initial position at (0, 0, 0)', () => {
        // This test will fail until we define the Player class
        const player = new Player(); // Assuming Player class exists
        expect(player.position).toEqual({ x: 0, y: 0, z: 0 });
    });

    test('should update position correctly when move is called', () => {
        const player = new Player();
        player.move(1, 0, -2);
        expect(player.position).toEqual({ x: 1, y: 0, z: -2 });
        player.move(-0.5, 0, 0.5);
        expect(player.position).toEqual({ x: 0.5, y: 0, z: -1.5 });
    });
});

describe('Obstacle', () => {
    test('should be created with a specified position', () => {
        const position = { x: 10, y: 0, z: 5 };
        const obstacle = new Obstacle(position);
        expect(obstacle.position).toEqual(position);
        expect(obstacle.maxHealth).toBe(3); // Default health
        expect(obstacle.currentHealth).toBe(3);
        expect(obstacle.size).toBe(1.0); // Default size
    });

    test('should be created with specified size', () => {
        const position = { x: 0, y: 0, z: 0 };
        const obstacle = new Obstacle(position, 3, 1.5);
        expect(obstacle.size).toBe(1.5);
    });

    test('should be created with specified health', () => {
        const position = { x: 0, y: 0, z: 0 };
        const obstacle = new Obstacle(position, 5);
        expect(obstacle.maxHealth).toBe(5);
        expect(obstacle.currentHealth).toBe(5);
    });

    test('should decrease health when takeDamage is called', () => {
        const obstacle = new Obstacle({ x: 0, y: 0, z: 0 }, 3);
        obstacle.takeDamage(1);
        expect(obstacle.currentHealth).toBe(2);
        obstacle.takeDamage(1);
        expect(obstacle.currentHealth).toBe(1);
    });

    test('takeDamage should return false if health > 0', () => {
        const obstacle = new Obstacle({ x: 0, y: 0, z: 0 }, 3);
        expect(obstacle.takeDamage(1)).toBe(false);
        expect(obstacle.takeDamage(1)).toBe(false);
    });

    test('takeDamage should return true if health reaches 0', () => {
        const obstacle = new Obstacle({ x: 0, y: 0, z: 0 }, 2);
        expect(obstacle.takeDamage(1)).toBe(false);
        expect(obstacle.takeDamage(1)).toBe(true); // Health is now 0
    });

    describe('World', () => {
        test('should initialize with empty entities array', () => {
            const world = new World();
            expect(world.entities).toEqual([]);
        });

        test('setPlayer should assign player property', () => {
            const world = new World();
            const player = new Player();
            world.setPlayer(player);
            expect(world.player).toBe(player);
        });

        test('addEntity should add to entities array', () => {
            const world = new World();
            const obstacle = new Obstacle({ x: 10, y: 0, z: 5 });
            world.addEntity(obstacle);
            expect(world.entities).toContain(obstacle);
        });

        describe('Procedural Generation', () => {
            test('generateTreePositions should return requested number of positions', () => {
                const positions = generateTreePositions(10, 40);
                expect(positions.length).toBe(10);
            });

            test('positions should be within specified area', () => {
                const areaSize = 50;
                const positions = generateTreePositions(100, areaSize);

                positions.forEach(pos => {
                    expect(pos.x).toBeGreaterThanOrEqual(-areaSize / 2);
                    expect(pos.x).toBeLessThanOrEqual(areaSize / 2);
                    expect(pos.z).toBeGreaterThanOrEqual(-areaSize / 2);
                    expect(pos.z).toBeLessThanOrEqual(areaSize / 2);
                });
            });

            test('positions should avoid center area', () => {
                const positions = generateTreePositions(100, 50);

                positions.forEach(pos => {
                    expect(Math.abs(pos.x)).not.toBeLessThan(5);
                    expect(Math.abs(pos.z)).not.toBeLessThan(5);
                });
            });

            test('should show some clustering behavior', () => {
                const positions = generateTreePositions(100, 50);

                // Count how many positions are close to others
                let clusteredCount = 0;
                for (let i = 1; i < positions.length; i++) {
                    const prev = positions[i - 1];
                    const curr = positions[i];
                    const distance = Math.sqrt(
                        Math.pow(curr.x - prev.x, 2) +
                        Math.pow(curr.z - prev.z, 2)
                    );
                    if (distance < 10) clusteredCount++;
                }

                expect(clusteredCount).toBeGreaterThan(10);
            });
        });
    });

    test('health should not go below 0', () => {
        const obstacle = new Obstacle({ x: 0, y: 0, z: 0 }, 1);
        expect(obstacle.takeDamage(1)).toBe(true);
        expect(obstacle.currentHealth).toBe(0);
        expect(obstacle.takeDamage(1)).toBe(true); // Still returns true
        expect(obstacle.currentHealth).toBe(0); // Stays at 0
    });
});