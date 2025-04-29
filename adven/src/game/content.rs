use super::world::{World, Room, Item};

/// Create the game world with rooms, items, and connections
pub fn create_world() -> World {
    let mut world = World::new("entrance");

    // Create rooms
    let mut entrance = Room::new(
        "entrance",
        "Cave Entrance",
        "You stand at the entrance of a dark, mysterious cave. Sunlight filters in from the opening behind you, but darkness looms ahead."
    );
    entrance.add_exit("north", "main_cavern");
    entrance.add_exit("south", "forest");
    entrance.add_item(Item::with_use_message(
        "Torch",
        "A wooden torch that could be lit to provide light in dark places.",
        true,
        "You light the torch. It flares brightly, casting a warm glow around you. The shadows in the cave seem to retreat a bit."
    ));

    let mut forest = Room::new(
        "forest",
        "Dense Forest",
        "Tall trees surround you, their branches forming a canopy that blocks most of the sunlight. The forest is quiet except for the occasional rustling of leaves."
    );
    forest.add_exit("north", "entrance");
    forest.add_exit("east", "clearing");
    forest.add_item(Item::with_use_message(
        "Berries",
        "Small, red berries that grow on a nearby bush. They look edible.",
        true,
        "You eat a few berries. They're sweet and juicy, with a slightly tangy aftertaste. You feel refreshed."
    ));

    let mut clearing = Room::new(
        "clearing",
        "Forest Clearing",
        "A small clearing in the forest where sunlight streams down. Wildflowers dot the grassy area, and you can hear birds singing."
    );
    clearing.add_exit("west", "forest");
    clearing.add_item(Item::with_use_message(
        "Flower",
        "A beautiful wildflower with vibrant petals.",
        true,
        "You smell the flower. Its sweet fragrance fills your nostrils, reminding you of spring meadows and sunny days."
    ));

    let mut main_cavern = Room::new(
        "main_cavern",
        "Main Cavern",
        "A large, echoing cavern with stalactites hanging from the ceiling. The air is cool and damp, and you can hear water dripping somewhere in the distance."
    );
    main_cavern.add_exit("south", "entrance");
    main_cavern.add_exit("north", "deep_tunnel");
    main_cavern.add_exit("east", "crystal_room");
    main_cavern.add_item(Item::with_use_message(
        "Stone",
        "A smooth, round stone that fits comfortably in your palm.",
        true,
        "You toss the stone into the darkness. It bounces with a clatter, the sound echoing through the cavern. After a moment, you hear a distant splash."
    ));

    let mut crystal_room = Room::new(
        "crystal_room",
        "Crystal Chamber",
        "This chamber is filled with glowing crystals of various colors. They emit enough light to illuminate the entire room, casting colorful shadows on the walls."
    );
    crystal_room.add_exit("west", "main_cavern");
    crystal_room.add_item(Item::with_use_message(
        "Crystal",
        "A small, glowing crystal that pulses with an inner light.",
        true,
        "You hold the crystal up. Its light intensifies, bathing the room in a soft blue glow. The crystal feels warm in your hand, and you sense a faint vibration, as if it's responding to your touch."
    ));

    let mut deep_tunnel = Room::new(
        "deep_tunnel",
        "Deep Tunnel",
        "A narrow tunnel that descends deeper into the earth. The air is stale, and the walls feel close on either side."
    );
    deep_tunnel.add_exit("south", "main_cavern");
    deep_tunnel.add_exit("north", "underground_lake");

    let mut underground_lake = Room::new(
        "underground_lake",
        "Underground Lake",
        "A vast underground lake stretches before you. The water is still and black, reflecting the stalactites above like a mirror. The air is humid and filled with the sound of dripping water."
    );
    underground_lake.add_exit("south", "deep_tunnel");
    underground_lake.add_item(Item::with_use_message(
        "Ancient Coin",
        "A tarnished coin made of an unknown metal, inscribed with symbols you don't recognize.",
        true,
        "You flip the coin and catch it. As it spins in the air, it emits a faint, melodic ringing sound. When you look at the result, you notice the symbols on the coin have shifted slightly, forming a pattern that almost looks like a map."
    ));

    // Add rooms to the world
    world.add_room(entrance);
    world.add_room(forest);
    world.add_room(clearing);
    world.add_room(main_cavern);
    world.add_room(crystal_room);
    world.add_room(deep_tunnel);
    world.add_room(underground_lake);

    world
}
