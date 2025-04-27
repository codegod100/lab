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
    entrance.add_item(Item::new(
        "Torch",
        "A wooden torch that could be lit to provide light in dark places.",
        true
    ));
    
    let mut forest = Room::new(
        "forest",
        "Dense Forest",
        "Tall trees surround you, their branches forming a canopy that blocks most of the sunlight. The forest is quiet except for the occasional rustling of leaves."
    );
    forest.add_exit("north", "entrance");
    forest.add_exit("east", "clearing");
    forest.add_item(Item::new(
        "Berries",
        "Small, red berries that grow on a nearby bush. They look edible.",
        true
    ));
    
    let mut clearing = Room::new(
        "clearing",
        "Forest Clearing",
        "A small clearing in the forest where sunlight streams down. Wildflowers dot the grassy area, and you can hear birds singing."
    );
    clearing.add_exit("west", "forest");
    clearing.add_item(Item::new(
        "Flower",
        "A beautiful wildflower with vibrant petals.",
        true
    ));
    
    let mut main_cavern = Room::new(
        "main_cavern",
        "Main Cavern",
        "A large, echoing cavern with stalactites hanging from the ceiling. The air is cool and damp, and you can hear water dripping somewhere in the distance."
    );
    main_cavern.add_exit("south", "entrance");
    main_cavern.add_exit("north", "deep_tunnel");
    main_cavern.add_exit("east", "crystal_room");
    main_cavern.add_item(Item::new(
        "Stone",
        "A smooth, round stone that fits comfortably in your palm.",
        true
    ));
    
    let mut crystal_room = Room::new(
        "crystal_room",
        "Crystal Chamber",
        "This chamber is filled with glowing crystals of various colors. They emit enough light to illuminate the entire room, casting colorful shadows on the walls."
    );
    crystal_room.add_exit("west", "main_cavern");
    crystal_room.add_item(Item::new(
        "Crystal",
        "A small, glowing crystal that pulses with an inner light.",
        true
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
    underground_lake.add_item(Item::new(
        "Ancient Coin",
        "A tarnished coin made of an unknown metal, inscribed with symbols you don't recognize.",
        true
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
