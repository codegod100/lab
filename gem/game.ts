// --- Basic Setup ---
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// --- Type Definitions ---
interface ItemDefinition {
  name: string;
  description: string;
  icon: string; // Emoji or URL
  width?: number; // For inventory grid display (optional)
  height?: number; // For inventory grid display (optional)
  effect?: string; // Description of tool effect
  placeable?: boolean; // Can this item be placed in the world?
  placeableType?: "structure" | "decoration"; // Category for placement logic
  // Function to get geometry for placement/preview
  geometry?: () => THREE.BufferGeometry;
  // Function to get material(s) for placement/preview
  material?: () => THREE.Material | THREE.Material[];
}

interface InventoryItem {
  type: string; // Key from itemDefinitions
  // Add quantity, durability etc. if needed later
}

// REMOVED: WorldObject, Resource, CraftedStructure interfaces
// We will use THREE.Object3D and THREE.Mesh directly, relying on userData.

// Type assertion for DOM elements (add checks where needed)
const invWoodEl = document.getElementById("inv-wood") as HTMLElement | null;
const invStoneEl = document.getElementById("inv-stone") as HTMLElement | null;
const messageLog = document.getElementById("message-log") as HTMLElement | null;
const inventoryPanel = document.getElementById(
  "inventory-panel",
) as HTMLElement | null;
const inventoryGrid = document.querySelector(
  ".inventory-grid",
) as HTMLElement | null;
// Ensure activeToolIndicator is fetched correctly, might need adjustment based on createToolIndicator
let activeToolIndicator = document.getElementById(
  "active-tool-indicator",
) as HTMLElement | null;
const gameControls = document.querySelector(
  ".game-controls",
) as HTMLElement | null;

// --- Global Variables with Types ---
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let player: THREE.Group; // Player model is a Group
let clock: THREE.Clock;
let moveMode = false;
// Use THREE.Mesh directly for selected objects (structures are Meshes)
let selectedObject: THREE.Mesh | null = null;
const moveSpeed = 8.0;
const keys: { [key: string]: boolean } = {}; // Keep track of pressed keys
// Use THREE.Object3D for resources (can be Mesh or Group)
const resources: THREE.Object3D[] = []; // Store collectible resource objects
// Use THREE.Mesh for crafted objects (structures are Meshes)
const craftedObjects: THREE.Mesh[] = []; // Store placed objects like huts, walls
// Resource counts (add other resources if needed)
const inventory: { [key: string]: number } = { wood: 0, stone: 0 };
const gatherDistance = 2.0;
const inventorySize = 20; // 5x4 grid
// Initialize inventory with nulls
const playerInventory: (InventoryItem | null)[] = new Array(inventorySize).fill(
  null,
);
let selectedItemIndex = -1;
let activeToolType: string | null = null; // Tracks currently active tool (item type string)
let isInPlacementMode = false;
let placementPreviewObject: THREE.Mesh | null = null; // Preview is always a Mesh
let placementItemType: string | null = null;
let placementIsValid = false;
let supported = false; // Variable to track if placement is supported (used in confirmPlacement message)

let mixer: THREE.AnimationMixer | null = null; // Initialize as null
let playerAnimations: { [key: string]: THREE.AnimationAction } = {};
let currentAnimation: string = "idle";
// Jump physics variables
const GRAVITY = 9.8;
const JUMP_FORCE = 5.0;
let playerVelocity = new THREE.Vector3(0, 0, 0); // For physics
let isOnGround = true; // For physics
let isJumping = false; // For physics
let jumpStartY = 0; // For jump height limit (optional)

// Preloaded resource models
let rockModel: THREE.Group | null = null; // Use Group to handle potential GLTF structure

// Item Definitions with Type
const itemDefinitions: { [key: string]: ItemDefinition } = {
  axe: {
    name: "Wooden Axe",
    description: "A simple axe for chopping trees faster.",
    icon: "🪓",
    effect: "Increases wood gathering by 2x",
  },
  hut: {
    name: "Small Hut",
    description: "A basic shelter.",
    icon: "🏠",
    placeable: true,
    placeableType: "structure",
    geometry: () => new THREE.BoxGeometry(3, 2, 3),
    material: () => new THREE.MeshStandardMaterial({ color: 0xd2b48c }), // Tan
  },
  // --- NEW BASE BUILDING ITEMS ---
  wall: {
    name: "Wooden Wall",
    description: "A sturdy wooden wall section.",
    icon: "🧱", // Placeholder icon
    placeable: true,
    placeableType: "structure",
    // Width, Height, Thickness - Align with grid size (e.g., 3)
    geometry: () => new THREE.BoxGeometry(3, 2.5, 0.3),
    material: () => new THREE.MeshStandardMaterial({ color: 0xae8a64 }), // Wood color
  },
  floor: {
    name: "Wooden Floor",
    description: "A simple wooden floor section.",
    icon: "🟫", // Brown square emoji
    placeable: true,
    placeableType: "structure",
    // Width, Height, Depth - Align with grid size (e.g., 3)
    geometry: () => new THREE.BoxGeometry(3, 0.2, 3),
    material: () => new THREE.MeshStandardMaterial({ color: 0xae8a64 }), // Wood color
  },
  // Add roof, door, window etc. later
};

// Crafting Recipes
const recipes: { [key: string]: { [resource: string]: number } } = {
  axe: { wood: 5, stone: 2 },
  hut: { wood: 10, stone: 5 },
  // --- NEW RECIPES ---
  wall: { wood: 4 },
  floor: { wood: 3 },
};

// Placement Materials (remain the same)
const placementMaterialValid = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  transparent: true,
  opacity: 0.6,
});
const placementMaterialInvalid = new THREE.MeshStandardMaterial({
  color: 0xff0000,
  transparent: true,
  opacity: 0.6,
});

// --- Helper function to dispose materials ---
function disposeMaterial(material: THREE.Material | THREE.Material[] | null) {
  // Added null check
  if (!material) return;
  if (Array.isArray(material)) {
    material.forEach((m) => m.dispose());
  } else {
    material.dispose();
  }
}

// --- Helper function to dispose Object3D resources/structures correctly ---
function disposeObject3D(obj: THREE.Object3D | null) {
  if (!obj) return;

  // Traverse children for groups/meshes
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose();
      disposeMaterial(child.material);
    }
  });

  // If the object itself is a mesh (and not handled by traverse, e.g. single rock)
  if (obj instanceof THREE.Mesh) {
    obj.geometry?.dispose();
    disposeMaterial(obj.material);
  }
  // Note: We don't remove from parent here, assumes scene.remove() is called separately.
}

// --- Placement Functions ---

// Generic function to create the visual preview object
function createPlacementPreview(itemType: string): THREE.Mesh | null {
  const definition = itemDefinitions[itemType];
  if (!definition?.placeable || !definition.geometry) {
    console.error(
      `Item type "${itemType}" is not placeable or has no geometry defined.`,
    );
    return null;
  }

  try {
    const geometry = definition.geometry();
    // Start with the valid material, clone it so we don't share state across previews
    const previewMesh = new THREE.Mesh(
      geometry,
      placementMaterialValid.clone(), // Clone the valid material
    );
    previewMesh.castShadow = false;
    previewMesh.receiveShadow = false;
    // Store the type being previewed for validation logic
    previewMesh.userData = { placingType: itemType };
    return previewMesh;
  } catch (error) {
    console.error(`Error creating preview for ${itemType}:`, error);
    return null;
  }
}

// Generic function to create the actual placed structure
// Update return type to THREE.Mesh | null
function createStructureAtPosition(
  itemType: string,
  x: number,
  y: number,
  z: number,
  rotationY: number = 0,
): THREE.Mesh | null {
  // <-- Changed return type
  const definition = itemDefinitions[itemType];
  if (!definition?.placeable || !definition.geometry || !definition.material) {
    console.error(
      `Cannot create structure: Item type "${itemType}" is not placeable or lacks geometry/material.`,
    );
    return null;
  }

  try {
    const geometry = definition.geometry();
    const material = definition.material(); // Get potentially new material instance(s)
    // Create a standard Mesh
    const structureMesh = new THREE.Mesh(geometry, material);

    // Assign properties directly (they exist on Mesh)
    structureMesh.position.set(x, y, z);
    structureMesh.rotation.y = rotationY;
    structureMesh.castShadow = true;
    structureMesh.receiveShadow = true;
    // Ensure userData is initialized if it doesn't exist (it should on Mesh)
    structureMesh.userData = structureMesh.userData || {};
    structureMesh.userData.type = itemType; // Store the type

    scene.add(structureMesh);
    // No need to cast anymore, just push the Mesh
    craftedObjects.push(structureMesh);

    return structureMesh; // Return the THREE.Mesh
  } catch (error) {
    console.error(`Error creating structure mesh for ${itemType}:`, error);
    addMessage(`Error creating ${definition.name} object.`);
    return null;
  }
}

// NEW: Creates the visual preview object (ghost hut) - DEPRECATED? createPlacementPreview is generic
// Keeping for now in case it's used elsewhere, but should likely be removed if unused.
function createHutPreview(): THREE.Object3D | null {
  console.warn(
    "createHutPreview is likely deprecated, use createPlacementPreview",
  );
  // Use the same geometry as the final hut for accurate preview
  const hutGeometry = new THREE.BoxGeometry(3, 2, 3); // Match createHutAtPosition
  // Start with the valid material
  const previewHut = new THREE.Mesh(
    hutGeometry,
    placementMaterialValid.clone(),
  ); // Clone material
  previewHut.castShadow = false; // Preview doesn't need to cast shadows
  previewHut.receiveShadow = false;
  return previewHut;
}

// NEW: Updates the position and validity of the placement preview
function updatePlacementPreview() {
  if (!isInPlacementMode || !placementPreviewObject || !placementItemType)
    return;

  const definition = itemDefinitions[placementItemType];
  // Check for geometry function existence before calling it
  if (!definition?.placeable || typeof definition.geometry !== "function")
    return;

  const placementDistance = 5; // How far in front of the player to place
  const gridSize = 3.0; // Snap to a 3x3 grid (should match wall/floor dimensions)

  // Calculate position in front of the player
  const forward = new THREE.Vector3();
  player.getWorldDirection(forward);
  forward.y = 0; // Keep it level with the ground for placement
  forward.normalize();

  const targetPosition = player.position
    .clone()
    .addScaledVector(forward, placementDistance);

  // --- Snapping Logic (Grid) ---
  targetPosition.x = Math.round(targetPosition.x / gridSize) * gridSize;
  targetPosition.z = Math.round(targetPosition.z / gridSize) * gridSize;

  // Adjust Y based on item type and potential support
  // Get geometry to calculate height, handle potential errors
  let itemGeometry: THREE.BufferGeometry | null = null;
  try {
    itemGeometry = definition.geometry();
  } catch (e) {
    console.error("Error getting geometry for height calculation:", e);
    return; // Cannot proceed without geometry
  }
  // Check if geometry has parameters and height (BoxGeometry does)
  // Use 'any' or define specific geometry types if needed, or check geometry type
  let itemHeight = 1; // Default height
  if (itemGeometry instanceof THREE.BoxGeometry) {
    itemHeight = itemGeometry.parameters.height;
  } else if (itemGeometry instanceof THREE.CylinderGeometry) {
    itemHeight = itemGeometry.parameters.height;
  } // Add other geometry types as needed
  let baseHeight = 0; // Ground level

  // --- Check for supporting object below (e.g., floor for a wall) ---
  const down = new THREE.Vector3(0, -1, 0);
  // Raycast origin slightly above the target base to avoid self-intersection
  const rayOrigin = targetPosition.clone().setY(baseHeight + itemHeight + 0.1); // Use calculated itemHeight, start slightly above
  const raycaster = new THREE.Raycaster(rayOrigin, down, 0, itemHeight + 0.2); // Check slightly more than itemHeight below
  const structuresToCheck = craftedObjects.filter(
    (o) => o !== placementPreviewObject,
  ); // Don't check self
  const groundPlane = scene.children.find(
    (c) => c instanceof THREE.Mesh && c.geometry instanceof THREE.PlaneGeometry,
  );
  const checkList: THREE.Object3D[] = groundPlane // Ensure checkList is Object3D[]
    ? structuresToCheck.concat(groundPlane as THREE.Mesh)
    : structuresToCheck;

  const intersects = raycaster.intersectObjects(checkList);
  supported = false; // Reset supported flag each update
  let supportHeight = 0;

  if (intersects.length > 0) {
    const firstIntersect = intersects[0];
    // Check if the intersection point is reasonably close to the target position's XZ
    if (
      Math.abs(firstIntersect.point.x - targetPosition.x) < gridSize / 2 &&
      Math.abs(firstIntersect.point.z - targetPosition.z) < gridSize / 2
    ) {
      supported = true;
      supportHeight = firstIntersect.point.y; // Height of the support object/ground
    }
  }
  // --- End Support Check ---

  // Adjust Y position based on item type and support
  if (placementItemType === "floor") {
    targetPosition.y = supportHeight + itemHeight / 2; // Place floor slightly above ground/support
  } else if (placementItemType === "wall") {
    // Place wall on top of support (ground or floor)
    targetPosition.y = supportHeight + itemHeight / 2;
  } else if (placementItemType === "hut") {
    targetPosition.y = supportHeight + itemHeight / 2; // Hut base on ground/support
  } else {
    // Default: center based on height above support
    targetPosition.y = supportHeight + itemHeight / 2;
  }

  placementPreviewObject.position.copy(targetPosition);
  // Keep preview rotation aligned with player for now, allow rotation with 'R'
  // placementPreviewObject.rotation.y = player.rotation.y; // Might be desired

  // --- Placement Validity Check ---
  placementIsValid = true; // Assume valid initially

  // 1. Check for Collision with other crafted objects (using Bounding Box)
  const previewBox = new THREE.Box3().setFromObject(placementPreviewObject);
  for (const obj of craftedObjects) {
    // obj is THREE.Mesh here
    if (obj === placementPreviewObject) continue; // Skip self
    const existingBox = new THREE.Box3().setFromObject(obj);
    // Allow slight overlap for adjacent walls/floors, disallow major intersection
    const intersection = previewBox.clone().intersect(existingBox);
    if (!intersection.isEmpty()) {
      // Calculate intersection volume or dimensions to decide if it's too much overlap
      const intersectionSize = intersection.getSize(new THREE.Vector3());
      // Allow minor overlap (e.g., less than 10cm) for snapping feel
      if (
        intersectionSize.x > 0.1 &&
        intersectionSize.y > 0.1 &&
        intersectionSize.z > 0.1
      ) {
        placementIsValid = false;
        // console.log("Collision with crafted object detected");
        break;
      }
    }
  }

  // 2. Check for Collision with resources
  if (placementIsValid) {
    for (const resource of resources) {
      // resource is THREE.Object3D here
      const resourceBox = new THREE.Box3().setFromObject(resource);
      if (previewBox.intersectsBox(resourceBox)) {
        placementIsValid = false;
        // console.log("Collision with resource detected");
        break;
      }
    }
  }

  // 3. Check for necessary support (e.g., walls need ground/floor)
  if (placementIsValid) {
    if (placementItemType === "wall" || placementItemType === "hut") {
      // Requires support found by the raycast earlier
      if (!supported) {
        placementIsValid = false; // Disallow floating walls/huts
        // console.log(`${placementItemType} requires support below.`);
      }
    }
    // Add checks for floors needing flat ground, etc. if desired
  }

  // Update preview material based on validity
  // Ensure material is not an array before assigning
  if (
    placementPreviewObject.material &&
    !Array.isArray(placementPreviewObject.material)
  ) {
    // Assign the shared material instances directly
    placementPreviewObject.material = placementIsValid
      ? placementMaterialValid
      : placementMaterialInvalid;
  }
}

// Confirms placement at the current preview location
function confirmPlacement() {
  if (!isInPlacementMode || !placementPreviewObject || !placementItemType) {
    // Don't show message if not even in placement mode
    return;
  }

  if (!placementIsValid) {
    addMessage("Cannot place object here.");
    // Provide more specific feedback based on why placementIsValid is false
    if (placementItemType) {
      const definition = itemDefinitions[placementItemType];
      // Check the 'supported' flag which was updated in updatePlacementPreview
      if (definition?.placeableType === "structure" && !supported) {
        addMessage("Placement requires support below.");
      } else {
        addMessage("Placement position is obstructed."); // Generic obstruction message
      }
    }
    return;
  }

  const definition = itemDefinitions[placementItemType];
  if (!definition) {
    console.error("Placement item type definition not found!");
    cancelPlacement(); // Clean up placement state
    return;
  }

  // Create the actual object at the preview's position and rotation
  // placedObject is THREE.Mesh | null
  const placedObject = createStructureAtPosition(
    // Use the generic function
    placementItemType,
    placementPreviewObject.position.x,
    placementPreviewObject.position.y,
    placementPreviewObject.position.z,
    placementPreviewObject.rotation.y, // Pass rotation
  );

  if (placedObject) {
    addMessage(`${definition.name} placed successfully!`);

    // --- Consume the item from inventory ---
    // Find the specific item instance that was selected (if applicable)
    // or just find the first instance of the required type.
    let itemIndexToRemove = -1;
    if (
      selectedItemIndex >= 0 &&
      playerInventory[selectedItemIndex]?.type === placementItemType
    ) {
      itemIndexToRemove = selectedItemIndex;
    } else {
      // Fallback: find the first instance if the selected item wasn't the one used
      itemIndexToRemove = playerInventory.findIndex(
        (item) => item?.type === placementItemType,
      );
    }

    if (itemIndexToRemove !== -1) {
      playerInventory[itemIndexToRemove] = null; // Remove item
      // If the removed item was the selected one, deselect
      if (selectedItemIndex === itemIndexToRemove) {
        selectedItemIndex = -1;
      }
      updateInventoryDisplay();
    } else {
      // This case should ideally not happen if placement started via 'U' key
      console.warn(
        `Placed item "${placementItemType}" not found in inventory after placement confirmation.`,
      );
      addMessage(
        `Error: Could not find ${definition.name} in inventory to remove.`,
      );
    }
  } else {
    addMessage(`Failed to place ${definition.name}.`);
    // Don't consume item if placement failed internally
  }

  // --- Clean up placement mode ---
  if (placementPreviewObject) {
    scene.remove(placementPreviewObject);
    // Dispose geometry and the *cloned* preview material
    placementPreviewObject.geometry?.dispose();
    disposeMaterial(placementPreviewObject.material); // Safe to dispose cloned material
  }
  placementPreviewObject = null;
  isInPlacementMode = false;
  placementItemType = null;
  placementIsValid = false;
  supported = false; // Reset supported flag
  // No need to update UI here, handled by item consumption or cancellation
}

// Cancel placement (minor update for cleanup)
function cancelPlacement() {
  if (!isInPlacementMode) return;

  addMessage("Placement cancelled.");

  // --- Clean up placement mode ---
  if (placementPreviewObject) {
    scene.remove(placementPreviewObject);
    // Dispose geometry and the *cloned* preview material
    placementPreviewObject.geometry?.dispose();
    disposeMaterial(placementPreviewObject.material);
  }
  placementPreviewObject = null;
  isInPlacementMode = false;
  placementItemType = null;
  placementIsValid = false;
  supported = false; // Reset supported flag

  // No need to give item back, as it wasn't removed yet.
  updateInventoryDisplay(); // Refresh UI in case selection changed visually
}

// Use the selected item (updated for generic placement)
function useSelectedItem() {
  if (selectedItemIndex < 0 || !playerInventory[selectedItemIndex]) {
    addMessage("No item selected.");
    return;
  }
  if (isInPlacementMode) {
    addMessage("Already placing an object. Confirm (E) or Cancel (Esc).");
    return;
  }
  if (moveMode) {
    addMessage(
      "Cannot use items while moving an object. Confirm (Enter) or Cancel (Esc).",
    );
    return;
  }

  const item = playerInventory[selectedItemIndex];
  if (!item) return; // Should not happen with check above, but safety

  const itemDef = itemDefinitions[item.type];
  if (!itemDef) {
    console.error(`Item definition not found for type: ${item.type}`);
    addMessage("Cannot use item: definition missing.");
    return;
  }

  if (itemDef.placeable) {
    // --- START PLACEMENT MODE ---
    isInPlacementMode = true;
    placementItemType = item.type;

    // Create the preview object
    placementPreviewObject = createPlacementPreview(item.type); // Use generic preview creator
    if (placementPreviewObject) {
      scene.add(placementPreviewObject);
      addMessage(
        `Placing ${itemDef.name}. Move to position, E=Place, R=Rotate, Esc=Cancel.`,
      );
      updatePlacementPreview(); // Initial position update
    } else {
      // Failed to create preview
      cancelPlacement(); // Clean up placement state
      addMessage(`Error starting placement for ${itemDef.name}.`);
    }
    // --- END PLACEMENT MODE INITIATION ---
    // Item is NOT removed yet. Only on confirmPlacement.
  } else {
    // Item is a tool or consumable (not placeable)
    // Tool activation logic
    if (activeToolType === item.type) {
      // Tool is already active, deactivate it
      activeToolType = null;
      addMessage(`${itemDef.name} deactivated`);
    } else {
      // Deactivate previous tool if any
      if (activeToolType) {
        const prevToolDef = itemDefinitions[activeToolType];
        if (prevToolDef) addMessage(`${prevToolDef.name} deactivated.`);
      }
      // Activate the new tool
      activeToolType = item.type;
      addMessage(`${itemDef.name} activated`);
    }
    updateToolIndicator();
    // Since a tool was used/toggled, deselect it from inventory view
    selectedItemIndex = -1;
  }

  updateInventoryDisplay(); // Update UI after any action
}

// Add item to inventory (modified from existing craft function)
function addItemToInventory(itemType: string): boolean {
  // Added return type hint
  // Find first empty slot
  const emptySlot = playerInventory.findIndex(
    (slot) => slot === null || slot === undefined,
  );

  if (emptySlot !== -1) {
    // Check if a slot was found
    const newItem: InventoryItem = { type: itemType }; // Ensure type
    playerInventory[emptySlot] = newItem;
    const itemDef = itemDefinitions[itemType];
    addMessage(`Added ${itemDef ? itemDef.name : itemType} to inventory`);
    updateInventoryDisplay();
    return true;
  } else if (playerInventory.length < inventorySize) {
    // Check if we can append (shouldn't happen with fixed size)
    const newItem: InventoryItem = { type: itemType };
    playerInventory.push(newItem); // This technically expands the array beyond inventorySize
    console.warn("Inventory expanded beyond initial size. Check logic.");
    const itemDef = itemDefinitions[itemType];
    addMessage(`Added ${itemDef ? itemDef.name : itemType} to inventory`);
    updateInventoryDisplay();
    return true;
  } else {
    addMessage("Inventory is full!");
    return false;
  }
}

// Modify the existing craft functions to use the new inventory
function craftItem(itemName: string) {
  // Added type hint
  const recipe = recipes[itemName];
  if (!recipe) {
    addMessage(`Unknown recipe: ${itemName}`);
    return;
  }

  // Check if player has enough resources
  let canCraft = true;
  for (const resourceType in recipe) {
    if (
      !inventory.hasOwnProperty(resourceType) ||
      inventory[resourceType] < recipe[resourceType]
    ) {
      canCraft = false;
      addMessage(`Not enough ${resourceType}. Need ${recipe[resourceType]}.`);
      break;
    }
  }

  if (canCraft) {
    // Deduct resources
    for (const resourceType in recipe) {
      inventory[resourceType] -= recipe[resourceType];
    }

    // Instead of adding to old inventory, add to new Diablo-style inventory
    if (addItemToInventory(itemName)) {
      // Message handled by addItemToInventory
      // addMessage(`Crafted 1 ${itemName}!`); // Redundant message
    } else {
      // Refund resources if inventory is full
      addMessage(`Inventory full, cannot store crafted ${itemName}.`); // More specific message
      for (const resourceType in recipe) {
        inventory[resourceType] += recipe[resourceType];
      }
    }

    updateInventoryUI(); // Update the resources display
  }
}

// For the cheat code, modify to use new inventory
function cheatCreateHut() {
  // Add hut item to inventory using the existing function
  if (addItemToInventory("hut")) {
    // Message is handled by addItemToInventory
  } else {
    addMessage("Inventory full, cannot add cheat hut.");
  }
  // Don't place it automatically anymore
}

// Generic Cheat Function
function cheatCreateItem(itemType: string) {
  if (!itemDefinitions[itemType]) {
    addMessage(`Cheat failed: Unknown item type "${itemType}".`);
    return;
  }
  if (addItemToInventory(itemType)) {
    // Message handled by addItemToInventory
  } else {
    addMessage(`Inventory full, cannot add cheat item "${itemType}".`);
  }
}

function loadPlayerModel(modelPath: string): Promise<THREE.Group> {
  // Added type hints
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();

    loader.load(
      modelPath,
      (gltf) => {
        // Success callback
        const model = gltf.scene;
        model.traverse((node) => {
          // Use type guard for isMesh
          if (node instanceof THREE.Mesh) {
            node.castShadow = true;
            node.receiveShadow = true; // Player model can receive shadows too
          }
        });

        // Scale and position adjustments if needed
        model.scale.set(0.01, 0.01, 0.01); // Adjust scale as needed
        model.position.y = 0; // Adjust vertical position as needed

        // Set up animations
        if (gltf.animations && gltf.animations.length) {
          console.log(
            "Available animations:",
            gltf.animations.map((a) => a.name),
          );

          // Create animation mixer
          mixer = new THREE.AnimationMixer(model);

          // Process and store animations
          gltf.animations.forEach((clip) => {
            const name = clip.name.toLowerCase().replace(/\s+/g, "_"); // Normalize name
            // Ensure mixer exists before calling clipAction
            if (mixer) {
              playerAnimations[name] = mixer.clipAction(clip);
            }
          });

          // Try to play an idle animation
          const idleAnim = findAnimation(["idle", "stand", "default"]);
          if (idleAnim) {
            playAnimation(idleAnim);
          } else if (Object.keys(playerAnimations).length > 0) {
            // Play first animation if no idle found
            playAnimation(Object.keys(playerAnimations)[0]);
          }

          // Create debug UI for easier testing
          // createAnimationDebugUI();
        }
        resolve(model);
      },
      // Progress callback
      (xhr) => {
        // console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`); // Can be noisy
      },
      // Error callback
      (error) => {
        console.error("Error loading model:", error);
        reject(error);
      },
    );
  });
}
function createAnimationDebugUI() {
  if (!playerAnimations || Object.keys(playerAnimations).length === 0) {
    return;
  }

  const existingPanel = document.getElementById("animation-debug-panel");
  if (existingPanel) return; // Don't create multiple panels

  const debugPanel = document.createElement("div");
  debugPanel.id = "animation-debug-panel"; // Add ID for checking existence
  debugPanel.style.position = "fixed";
  debugPanel.style.top = "10px";
  debugPanel.style.left = "10px";
  debugPanel.style.backgroundColor = "rgba(0,0,0,0.7)";
  debugPanel.style.color = "white";
  debugPanel.style.padding = "10px";
  debugPanel.style.borderRadius = "5px";
  debugPanel.style.zIndex = "1000";
  debugPanel.style.maxHeight = "300px";
  debugPanel.style.overflowY = "auto";

  const title = document.createElement("div");
  title.textContent = "Animations";
  title.style.fontWeight = "bold";
  title.style.marginBottom = "5px";
  debugPanel.appendChild(title);

  // Create buttons for each animation
  Object.keys(playerAnimations).forEach((name) => {
    const button = document.createElement("button");
    button.textContent = name;
    button.style.display = "block";
    button.style.margin = "2px 0";
    button.style.padding = "2px 5px";
    button.addEventListener("click", () => playAnimation(name));
    debugPanel.appendChild(button);
  });

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close";
  closeBtn.style.marginTop = "10px";
  closeBtn.addEventListener("click", () => {
    document.body.removeChild(debugPanel);
  });
  debugPanel.appendChild(closeBtn);

  document.body.appendChild(debugPanel);
}

// Find animation by keywords
function findAnimation(keywords: string[]): string | null {
  if (!playerAnimations || Object.keys(playerAnimations).length === 0) {
    return null;
  }

  for (const keyword of keywords) {
    // Find an exact match or a name containing the keyword
    const match = Object.keys(playerAnimations).find(
      (name) => name === keyword || name.includes(keyword),
    );
    if (match) return match;
  }

  return null; // No match found
}

// Play animation with crossfade
function playAnimation(name: string, duration: number = 0.5): boolean {
  // Added return type hint
  if (!mixer) return false; // Need mixer to play animations

  const targetAction = playerAnimations[name];
  if (!targetAction) {
    console.warn(`Animation "${name}" not found!`);
    return false;
  }

  if (currentAnimation === name && targetAction.isRunning()) return true; // Already playing and running

  const currentAction = currentAnimation
    ? playerAnimations[currentAnimation]
    : null;

  // Stop and reset the target action before fading in
  targetAction.stop(); // Ensure it's stopped before playing again
  targetAction.reset(); // Reset time to start from beginning

  if (currentAction && currentAction !== targetAction) {
    currentAction.fadeOut(duration);
  }

  targetAction
    .setEffectiveTimeScale(1)
    .setEffectiveWeight(1)
    .fadeIn(duration)
    .play();
  currentAnimation = name;

  // console.log(`Playing animation: ${name}`); // Can be noisy
  return true;
}

// --- NEW: Function to create a low-poly tree ---
function createLowPolyTree(): THREE.Group {
  const tree = new THREE.Group();

  // --- Trunk ---
  const trunkHeight = THREE.MathUtils.randFloat(1.5, 3.5);
  const trunkRadius = THREE.MathUtils.randFloat(0.15, 0.3);
  const trunkGeometry = new THREE.CylinderGeometry(
    trunkRadius * 0.8,
    trunkRadius,
    trunkHeight,
    5,
    1,
  ); // Low poly (5 sides)
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b4513, // Brown
    roughness: 0.9,
    metalness: 0.1,
  });
  const trunkMesh = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunkMesh.position.y = trunkHeight / 2; // Position base at 0
  trunkMesh.castShadow = true;
  trunkMesh.receiveShadow = true;
  tree.add(trunkMesh);

  // --- Leaves ---
  const leafTypes = ["cone", "icosahedron", "stacked"];
  const leafType = leafTypes[Math.floor(Math.random() * leafTypes.length)];
  const leafColor = new THREE.Color(0x228b22); // Forest Green base
  leafColor.offsetHSL(
    THREE.MathUtils.randFloat(-0.05, 0.05),
    THREE.MathUtils.randFloat(-0.1, 0.1),
    THREE.MathUtils.randFloat(-0.1, 0.1),
  ); // Slight color variation
  const leafMaterial = new THREE.MeshStandardMaterial({
    color: leafColor,
    roughness: 0.8,
    metalness: 0.0,
  });

  const addLeaves = (yOffset: number, scale: number) => {
    let leafGeometry: THREE.BufferGeometry;
    const leafHeight = THREE.MathUtils.randFloat(1.5, 2.5) * scale;
    const leafRadius = THREE.MathUtils.randFloat(0.8, 1.5) * scale;

    if (
      leafType === "cone" ||
      (leafType === "stacked" && Math.random() < 0.7)
    ) {
      leafGeometry = new THREE.ConeGeometry(leafRadius, leafHeight, 6); // Low poly cone
    } else {
      // icosahedron or stacked variant
      leafGeometry = new THREE.IcosahedronGeometry(
        leafRadius * 0.8,
        Math.random() < 0.5 ? 0 : 1,
      ); // More rounded or pointy
    }

    const leafMesh = new THREE.Mesh(leafGeometry, leafMaterial);
    leafMesh.position.y = yOffset + leafHeight * 0.4; // Position leaves relative to offset
    leafMesh.castShadow = true;
    leafMesh.receiveShadow = false; // Leaves often don't receive distinct shadows well

    // Random tilt
    leafMesh.rotation.x += THREE.MathUtils.randFloat(-0.1, 0.1);
    leafMesh.rotation.z += THREE.MathUtils.randFloat(-0.1, 0.1);

    tree.add(leafMesh);
  };

  if (leafType === "stacked") {
    const numStacks = THREE.MathUtils.randInt(2, 3);
    let currentY = trunkHeight * 0.8; // Start slightly below trunk top
    let currentScale = 1.0;
    for (let i = 0; i < numStacks; i++) {
      addLeaves(currentY, currentScale);
      currentY += 1.5 * currentScale * 0.5; // Move up for next stack
      currentScale *= 0.7; // Smaller stacks on top
    }
  } else {
    // Single leaf cluster, positioned near the top of the trunk
    addLeaves(trunkHeight * 0.9, 1.0);
  }

  // Add slight overall rotation for variety
  tree.rotation.y = Math.random() * Math.PI * 2;

  return tree;
}

// --- NEW: Load Resource Models ---
async function loadResourceModels() {
  const loader = new GLTFLoader();
  try {
    // --- REMOVED Tree Model Loading ---

    // Load Rock Model (remains the same)
    const rockGltf = await loader.loadAsync("./models/rock.glb"); // Make sure path is correct
    rockModel = rockGltf.scene;
    // Ensure rock model parts cast/receive shadows appropriately
    rockModel.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    console.log("Rock model loaded successfully.");
  } catch (error) {
    console.error("Error loading resource models:", error);
    addMessage("Failed to load some resource models.", true);
    // Game can continue with procedural trees and fallback rocks
  }
}

// --- Initialization ---
async function init() {
  console.log("Initializing game...");

  // Basic Scene Setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Sky blue background
  scene.fog = new THREE.Fog(0x87ceeb, 10, 70); // Add fog

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  // Camera starts behind the player position (which is 0,0,0 initially)
  // We will attach camera to player later

  // Renderer
  const canvas = document.getElementById("canvas") as HTMLCanvasElement | null; // Added type assertion
  // Ensure canvas exists before creating renderer
  if (!canvas) {
      console.error("Canvas element not found!");
      addMessage("FATAL ERROR: Canvas element not found!", true);
      return; // Stop initialization if canvas is missing
  }
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true; // Enable shadows
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
  // No need to appendChild again if using existing canvas element

  // Clock
  clock = new THREE.Clock();

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Soft ambient light
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // Brighter directional light
  directionalLight.position.set(15, 20, 10);
  directionalLight.castShadow = true;
  // Configure shadow properties
  directionalLight.shadow.mapSize.width = 2048; // Higher resolution shadows
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 100;
  directionalLight.shadow.camera.left = -60;
  directionalLight.shadow.camera.right = 60;
  directionalLight.shadow.camera.top = 60;
  directionalLight.shadow.camera.bottom = -60;
  scene.add(directionalLight);
  // Optional: Add a light helper
  // const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
  // scene.add(lightHelper);
  // const shadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
  // scene.add(shadowHelper);

  // Ground Plane
  const groundGeometry = new THREE.PlaneGeometry(120, 120); // Larger ground
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x55aa55, // Greenish color
    roughness: 0.9,
    metalness: 0.1,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2; // Rotate to be flat
  ground.receiveShadow = true; // Ground receives shadows
  scene.add(ground);

  // Player Placeholder (Group)
  player = new THREE.Group();
  player.position.set(0, 0, 0); // Start at origin ground level
  scene.add(player);

  // Load Player Model (async)
  try {
    const playerModel = await loadPlayerModel("./imp.glb"); // Ensure path is correct
    player.add(playerModel); // Add loaded model to the player group
    console.log("Player model loaded and added.");
  } catch (error) {
    console.error("Player model loading failed, using fallback:", error);
    addMessage("Failed to load player model, using fallback.", true);
    // Fallback Cube
    const fallbackGeo = new THREE.BoxGeometry(0.5, 1.7, 0.5); // Approx player size
    const fallbackMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const fallbackMesh = new THREE.Mesh(fallbackGeo, fallbackMat);
    fallbackMesh.position.y = 1.7 / 2; // Position base at player group origin
    fallbackMesh.castShadow = true;
    fallbackMesh.receiveShadow = true;
    player.add(fallbackMesh);
  }

  // Attach Camera to Player (after player group is created)
  // Position camera slightly behind and above the player model origin
  camera.position.set(0, 2.5, 5); // Adjust Y for height, Z for distance
  camera.lookAt(player.position.x, player.position.y + 1.0, player.position.z); // Look slightly above player feet
  player.add(camera); // Attach camera to player group

  // Load Resource Models (async)
  // await loadResourceModels(); // You might want to uncomment this if needed

  // Spawn Initial Resources
  spawnResources("wood", 100);
  spawnResources("stone", 80);

  // Initialize UI Systems
  initInventorySystem();
  createToolIndicator(); // Create the indicator element
  addSaveLoadButtons(); // Add save/load buttons

  // --- NEW: Add Crafting Button Event Listeners ---
  for (const itemName in recipes) {
    const button = document.getElementById(`craft-${itemName}-btn`);
    if (button) {
      // Add listener to call craftItem with the correct item name
      button.addEventListener("click", () => craftItem(itemName));
    } else {
      console.warn(`Crafting button element "craft-${itemName}-btn" not found during init.`);
    }
  }
  // --- END NEW ---

  // Initial UI Update
  updateInventoryUI(); // This will correctly set initial disabled state
  updateToolIndicator(); // Update display (should be hidden initially)

  // Event Listeners
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
  window.addEventListener("resize", onWindowResize);

  // Add initial message
  addMessage(
    "Welcome! WASD=Move, Space=Jump, E=Gather/Place, I=Inventory, M=Move Object, U=Use Item",
  );

  // Start Animation Loop
  animate(); // Make sure this is called *after* everything else is set up
  console.log("Initialization complete. Starting animation loop."); // DIAGNOSTIC LOG
}

// Separate KeyDown Handler
function handleKeyDown(event: KeyboardEvent) {
  // Ignore key presses if typing in an input/textarea
  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement ||
    (event.target instanceof HTMLElement && event.target.isContentEditable)
  ) {
    return;
  }

  const keyLower = event.key.toLowerCase();
  keys[keyLower] = true;

  // Handle single-press actions
  switch (keyLower) {
    case "e": // Gather resource OR Confirm Placement
      if (isInPlacementMode) {
        confirmPlacement();
      } else if (!moveMode) {
        // Don't gather if moving object
        tryGatherResource();
      }
      break;
    case " ": // Jump
      if (isOnGround && !isJumping && !moveMode && !isInPlacementMode) {
        // Prevent jumping in special modes
        startJump();
      }
      break;
    case "i": // Toggle Inventory
      toggleInventory();
      break;
    case "u": // Use Selected Item (Place or Activate Tool)
      useSelectedItem();
      break;
    case "m": // Toggle Move Mode
      toggleMoveMode();
      break;
    case "enter": // Confirm Move
      if (moveMode) {
        confirmMove();
      }
      break;
    case "escape": // Cancel Placement or Move Mode, Close Inventory
      if (isInPlacementMode) {
        cancelPlacement();
      } else if (moveMode) {
        toggleMoveMode(); // Use toggle to handle cancellation logic
      } else if (inventoryPanel && inventoryPanel.style.display === "block") {
        closeInventory();
      }
      break;
    case "r": // Rotate Placement Preview
      if (isInPlacementMode && placementPreviewObject) {
        placementPreviewObject.rotation.y += Math.PI / 2; // Rotate 90 degrees
        updatePlacementPreview(); // Update validity after rotation
      }
      break;
    // --- Cheats ---
    case "1": // Cheat: Add Wood
      if (event.shiftKey) {
        // Shift+1
        inventory.wood += 10;
        addMessage("Cheat: Added 10 wood.");
        updateInventoryUI();
      }
      break;
    case "2": // Cheat: Add Stone
      if (event.shiftKey) {
        // Shift+2
        inventory.stone += 10;
        addMessage("Cheat: Added 10 stone.");
        updateInventoryUI();
      }
      break;
    case "3": // Cheat: Add Axe
      if (event.shiftKey) cheatCreateItem("axe");
      break;
    case "4": // Cheat: Add Hut Item
      if (event.shiftKey) cheatCreateItem("hut");
      break;
    case "5": // Cheat: Add Wall Item
      if (event.shiftKey) cheatCreateItem("wall");
      break;
    case "6": // Cheat: Add Floor Item
      if (event.shiftKey) cheatCreateItem("floor");
      break;
  }
}

// Separate KeyUp Handler
function handleKeyUp(event: KeyboardEvent) {
  keys[event.key.toLowerCase()] = false;
}

// --- NEW: Jump Function ---
function startJump() {
  if (!isOnGround || isJumping) return; // Extra safety check

  isOnGround = false;
  isJumping = true;
  jumpStartY = player.position.y; // Record start height (optional)
  playerVelocity.y = JUMP_FORCE; // Apply upward force

  // Play jump animation
  const jumpAnim = findAnimation(["jump", "jump_start"]);
  if (jumpAnim) {
    playAnimation(jumpAnim, 0.1); // Quick transition to jump anim
  }
  // console.log("Jump started");
}

// Confirm Move Function
function confirmMove() {
  if (!moveMode || !selectedObject) return;

  // Check for collision at the final position before confirming
  const finalBox = new THREE.Box3().setFromObject(selectedObject);
  let collision = false;
  // Check against other crafted objects
  for (const obj of craftedObjects) {
    if (obj === selectedObject) continue;
    const existingBox = new THREE.Box3().setFromObject(obj);
    if (finalBox.intersectsBox(existingBox)) {
      collision = true;
      break;
    }
  }
  // Check against resources
  if (!collision) {
    for (const res of resources) {
      const resBox = new THREE.Box3().setFromObject(res);
      if (finalBox.intersectsBox(resBox)) {
        collision = true;
        break;
      }
    }
  }

  if (collision) {
    addMessage("Cannot confirm move, final position is obstructed.", true);
    // Optionally, snap the object back to its original position or last valid position
    return;
  }

  moveMode = false;
  // Reset emissive color (selectedObject is THREE.Mesh)
  // Check material exists and is not an array (standard check for Mesh)
  if (selectedObject.material && !Array.isArray(selectedObject.material)) {
    // Check if material has emissive property before trying to set it
    if ("emissive" in selectedObject.material) {
      (
        selectedObject.material as
          | THREE.MeshStandardMaterial
          | THREE.MeshPhysicalMaterial
      ).emissive?.setHex(0x000000);
    }
  }
  // Access userData safely
  const objectType = selectedObject.userData?.type || "object";
  addMessage(`Moved ${objectType} confirmed!`);
  selectedObject = null; // Deselect
  updateMoveUI(false); // Ensure highlight is removed (should be redundant but safe)
}

// --- UI Updates ---
function updateInventoryUI() {
  if (invWoodEl) invWoodEl.textContent = String(inventory.wood);
  if (invStoneEl) invStoneEl.textContent = String(inventory.stone);

  // Generic loop handles all craftable items based on recipes
  for (const itemName in recipes) {
    const button = document.getElementById(
      `craft-${itemName}-btn`,
    ) as HTMLButtonElement | null;
    if (button) {
      let canCraft = true;
      let needed: string[] = []; // Explicitly type 'needed' as string[]
      const currentRecipe = recipes[itemName]; // Cache recipe for readability

      for (const resourceType in currentRecipe) {
        // Ensure inventory has the property AND enough quantity
        if (
          !inventory.hasOwnProperty(resourceType) || // Check if resource type exists in inventory
          inventory[resourceType] < currentRecipe[resourceType] // Check quantity
        ) {
          canCraft = false;
          needed.push(`${currentRecipe[resourceType]} ${resourceType}`);
        }
      }

      button.disabled = !canCraft; // Disable button if cannot craft

      if (!canCraft) {
        // Set tooltip to show needed resources
        button.title = `Need: ${needed.join(", ")}`;
      } else {
        // Set tooltip to show item name and cost
        const costString = Object.entries(currentRecipe)
          .map(([res, amount]) => `${amount} ${res}`)
          .join(", ");
        const itemDef = itemDefinitions[itemName];
        button.title = `Craft ${itemDef ? itemDef.name : itemName} (Cost: ${costString})`;
      }
    } else {
      // Optional: Warn if a button defined in HTML isn't found for a recipe
      // console.warn(`Craft button element "craft-${itemName}-btn" not found.`);
    }
  }
}

// Add message to log (with optional error styling)
function addMessage(text: string, isError: boolean = false) {
  if (!messageLog) return; // Check if messageLog exists
  const p = document.createElement("p");
  p.textContent = `> ${text}`;
  if (isError) {
    p.style.color = "red";
    p.style.fontWeight = "bold";
  }
  // Prepend new messages to the top
  messageLog.insertBefore(p, messageLog.firstChild);

  // Limit number of messages
  const maxMessages = 7;
  while (messageLog.children.length > maxMessages) {
    if (messageLog.lastChild) {
      // Check if lastChild exists before removing
      messageLog.removeChild(messageLog.lastChild);
    } else {
      break; // Safety break
    }
  }
}

// Update the visual display of the inventory (with type safety)
function updateInventoryDisplay() {
  if (!inventoryGrid) return; // Check if grid exists
  const slots = inventoryGrid.querySelectorAll(".inventory-slot");

  // Clear all slots first (more robust clearing)
  slots.forEach((slot) => {
    slot.innerHTML = ""; // Clear content
    slot.className = "inventory-slot"; // Reset classes
    // Remove event listeners if necessary, though re-adding is usually fine
  });

  // Fill slots with items
  playerInventory.forEach((item, index) => {
    if (index >= slots.length) return; // Prevent errors if inventory size mismatch

    const slot = slots[index] as HTMLElement; // We know the slot exists now

    if (!item) {
      // Ensure empty slots are truly empty and reset classes
      slot.innerHTML = "";
      slot.className = "inventory-slot";
      return; // Skip null slots
    }

    slot.classList.add("occupied");

    if (index === selectedItemIndex) {
      slot.classList.add("selected");
    }

    // Create item display
    const itemDef = itemDefinitions[item.type];
    if (!itemDef) {
      console.warn(`Item definition not found for type: ${item.type}`);
      slot.textContent = "?"; // Placeholder for unknown item
      slot.title = `Unknown Item: ${item.type}`; // Tooltip for unknown
      return;
    }

    // Create icon (text or image)
    const iconContainer = document.createElement("div");
    iconContainer.className = "item-icon-container"; // For styling

    if (itemDef.icon.startsWith("http") || itemDef.icon.startsWith("./")) {
      // Check for URL or relative path
      // Image URL
      const img = document.createElement("img");
      img.src = itemDef.icon;
      img.alt = itemDef.name;
      img.style.maxWidth = "100%"; // Ensure image fits
      img.style.maxHeight = "100%";
      img.style.objectFit = "contain";
      img.draggable = false; // Prevent dragging image
      iconContainer.appendChild(img);
    } else {
      // Emoji or text
      const icon = document.createElement("div");
      icon.style.fontSize = "24px"; // Adjust as needed
      icon.style.textAlign = "center";
      icon.style.lineHeight = "40px"; // Approx vertical center for 40px slot height
      icon.textContent = itemDef.icon;
      iconContainer.appendChild(icon);
    }
    slot.appendChild(iconContainer);

    // Create tooltip
    const tooltip = document.createElement("div");
    tooltip.className = "item-tooltip";

    // Build tooltip HTML safely
    let tooltipHTML = `<div class="item-name">${itemDef.name}</div>`;
    tooltipHTML += `<div class="item-description">${itemDef.description}</div>`;
    if (itemDef.effect) {
      tooltipHTML += `<div class="item-effect">Effect: ${itemDef.effect}</div>`;
    }
    const recipe = recipes[item.type];
    if (recipe) {
      const costString = Object.entries(recipe)
        .map(([res, amount]) => `${amount} ${res}`)
        .join(", ");
      tooltipHTML += `<div class="item-cost">Cost: ${costString}</div>`;
    }
    tooltip.innerHTML = tooltipHTML;

    slot.appendChild(tooltip);
  });
}

// Select an inventory slot (with type safety)
function selectInventorySlot(index: number) {
  if (index < 0 || index >= playerInventory.length) return; // Index out of bounds

  const item = playerInventory[index]; // Can be InventoryItem | null

  if (item) {
    // Clicked on a slot with an item
    // Toggle selection
    if (selectedItemIndex === index) {
      selectedItemIndex = -1; // Deselect
      addMessage("Deselected item.");
    } else {
      selectedItemIndex = index;
      const itemDef = itemDefinitions[item.type];
      const name = itemDef ? itemDef.name : `Unknown (${item.type})`;
      addMessage(`Selected: ${name}. Press 'U' to use.`);
    }
    updateInventoryDisplay(); // Update visuals
  } else {
    // Clicked an empty slot, deselect if something was selected
    if (selectedItemIndex !== -1) {
      selectedItemIndex = -1;
      addMessage("Deselected item.");
      updateInventoryDisplay();
    }
  }
}

// Creates or finds the tool indicator element and its container
function createToolIndicator() {
  // Find or create the main container for UI elements like this
  let uiContainer = document.getElementById("game-ui-overlay");
  if (!uiContainer) {
    uiContainer = document.createElement("div");
    uiContainer.id = "game-ui-overlay";
    // Basic styling for the overlay container (adjust as needed)
    uiContainer.style.position = "fixed";
    uiContainer.style.bottom = "10px";
    uiContainer.style.left = "50%";
    uiContainer.style.transform = "translateX(-50%)";
    uiContainer.style.zIndex = "900"; // Below inventory/menus maybe
    uiContainer.style.display = "flex";
    uiContainer.style.gap = "10px";
    uiContainer.style.alignItems = "center";
    document.body.appendChild(uiContainer);
  }

  // Find or create the specific tool indicator element within the container
  activeToolIndicator = document.getElementById("active-tool-indicator");
  if (!activeToolIndicator) {
    activeToolIndicator = document.createElement("div");
    activeToolIndicator.id = "active-tool-indicator";
    activeToolIndicator.className = "active-tool-indicator"; // Use class for CSS styling
    activeToolIndicator.style.display = "none"; // Hidden by default
    activeToolIndicator.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
    activeToolIndicator.style.color = "white";
    activeToolIndicator.style.padding = "5px 10px";
    activeToolIndicator.style.borderRadius = "5px";
    // activeToolIndicator.style.display = "flex"; // Set display in updateToolIndicator
    activeToolIndicator.style.alignItems = "center";
    activeToolIndicator.style.gap = "8px";
    activeToolIndicator.style.fontSize = "14px";

    // Icon container
    const iconEl = document.createElement("div");
    iconEl.className = "indicator-icon"; // Class for styling
    iconEl.style.fontSize = "20px"; // Adjust icon size

    // Text container
    const textEl = document.createElement("div");
    textEl.className = "indicator-text"; // Class for styling

    // Add elements to indicator
    activeToolIndicator.appendChild(iconEl);
    activeToolIndicator.appendChild(textEl);

    // Add indicator to the main UI container
    uiContainer.appendChild(activeToolIndicator);
  }
}

// Update tool indicator display
function updateToolIndicator() {
  if (!activeToolIndicator) {
    console.warn("Tool indicator element not found.");
    return; // Check if indicator element exists
  }

  if (!activeToolType) {
    activeToolIndicator.style.display = "none";
    return;
  }

  const toolDef = itemDefinitions[activeToolType];
  if (!toolDef) {
    console.warn(`Definition for active tool "${activeToolType}" not found.`);
    activeToolIndicator.style.display = "none"; // Hide if definition is missing
    activeToolType = null; // Clear invalid tool type
    return;
  }

  // Safely query selector elements within the indicator
  const iconElement = activeToolIndicator.querySelector(
    ".indicator-icon",
  ) as HTMLElement | null;
  const textElement = activeToolIndicator.querySelector(
    ".indicator-text",
  ) as HTMLElement | null;

  if (iconElement) iconElement.textContent = toolDef.icon;
  if (textElement) textElement.textContent = toolDef.name;

  // Show the indicator
  activeToolIndicator.style.display = "flex"; // Use flex to show
}

// --- Save/Load ---

// Define a type for the save data structure for better type safety
interface SaveData {
  playerPosition: { x: number; y: number; z: number };
  playerRotation: number;
  inventory: { [key: string]: number };
  playerInventory: (InventoryItem | null)[];
  selectedItemIndex: number;
  activeToolType: string | null;
  structures: {
    type: string;
    position: { x: number; y: number; z: number };
    rotation: number;
  }[];
  version: string;
  savedAt: string;
}

function saveGame(): boolean {
  // Added return type hint
  try {
    // Create a save data object conforming to the SaveData interface
    const saveData: SaveData = {
      // Player data
      playerPosition: {
        x: player.position.x,
        y: player.position.y,
        z: player.position.z,
      },
      playerRotation: player.rotation.y,

      // Resources
      inventory: { ...inventory }, // Copy inventory object

      // Inventory items
      playerInventory: playerInventory.map((item) =>
        item ? { ...item } : null,
      ), // Deep copy
      selectedItemIndex,
      activeToolType,

      // Crafted structures (iterate through THREE.Mesh array)
      structures: craftedObjects.map((obj) => ({
        // Access properties directly from THREE.Mesh
        type: obj.userData?.type || "unknown", // Safe access to userData
        position: {
          x: obj.position.x,
          y: obj.position.y,
          z: obj.position.z,
        },
        rotation: obj.rotation.y,
      })),

      // Game version/timestamp for compatibility checking
      version: "1.1", // Increment version if format changes
      savedAt: new Date().toISOString(),
    };

    // Save to localStorage
    localStorage.setItem("survivalGameSave", JSON.stringify(saveData));
    addMessage("Game saved successfully!");
    // console.log("Game saved:", saveData);
    return true;
  } catch (error) {
    console.error("Error saving game:", error);
    addMessage("Error saving game!", true);
    return false;
  }
}

function loadGame(): boolean {
  // Added return type hint
  try {
    // Get save data from localStorage, check for null
    const savedDataString = localStorage.getItem("survivalGameSave");
    if (!savedDataString) {
      addMessage("No saved game found.");
      return false;
    }
    // Parse only if string exists
    const saveData: SaveData = JSON.parse(savedDataString); // Assume structure matches SaveData

    if (!saveData) {
      // Should be redundant now, but keep as safety
      addMessage("Failed to parse save data.");
      return false;
    }

    // Optional: Version check for compatibility
    if (saveData.version !== "1.1") {
      addMessage(
        `Save data is from an incompatible version (${saveData.version}). Loading may cause issues.`,
        true,
      );
      // Potentially add migration logic here if needed
    }

    // Reset current game state BEFORE loading
    resetGameState();

    // Restore player position and rotation
    if (saveData.playerPosition) {
      player.position.set(
        saveData.playerPosition.x,
        saveData.playerPosition.y,
        saveData.playerPosition.z,
      );
    }
    if (saveData.playerRotation !== undefined) {
      player.rotation.y = saveData.playerRotation;
    }
    // Reset physics state after setting position
    playerVelocity.set(0, 0, 0);
    isOnGround = true; // Assume loaded onto ground initially
    isJumping = false;

    // Restore resource inventory
    if (saveData.inventory) {
      // Clear existing inventory and copy saved data
      Object.keys(inventory).forEach((key) => delete inventory[key]); // Clear current
      Object.assign(inventory, saveData.inventory); // Copy saved values
    }

    // Restore player item inventory
    if (saveData.playerInventory && Array.isArray(saveData.playerInventory)) {
      // Ensure the loaded inventory fits the current size
      playerInventory.fill(null); // Clear current inventory
      for (
        let i = 0;
        i < Math.min(inventorySize, saveData.playerInventory.length);
        i++
      ) {
        // Use inventorySize limit
        playerInventory[i] = saveData.playerInventory[i];
      }
    }

    // Restore selected item and active tool
    selectedItemIndex = saveData.selectedItemIndex ?? -1;
    activeToolType = saveData.activeToolType ?? null;

    // Rebuild structures
    if (saveData.structures && Array.isArray(saveData.structures)) {
      saveData.structures.forEach((structureData) => {
        // Type is inferred from SaveData
        if (
          structureData.type &&
          structureData.position &&
          itemDefinitions[structureData.type]
        ) {
          // Check type exists in definitions
          // createStructureAtPosition handles adding to scene/craftedObjects array
          createStructureAtPosition(
            structureData.type,
            structureData.position.x,
            structureData.position.y,
            structureData.position.z,
            structureData.rotation || 0,
          );
        } else {
          console.warn(
            "Skipping invalid or unknown structure data during load:",
            structureData,
          );
        }
      });
    }

    // Respawn resources (optional - current approach respawns on init/reset)
    // If you want resources to persist, you'd need to save/load them too.
    // For now, loading effectively resets resources.
    spawnResources("wood", 100); // Respawn after reset
    spawnResources("stone", 80);

    // Update all UI components
    updateInventoryUI();
    updateInventoryDisplay();
    updateToolIndicator();

    addMessage("Game loaded successfully!");
    // console.log("Game loaded:", saveData);
    return true;
  } catch (error) {
    console.error("Error loading game:", error);
    addMessage("Error loading game! Save data might be corrupted.", true);
    // Attempt to reset to a clean state if loading fails badly
    resetGameState();
    spawnResources("wood", 100);
    spawnResources("stone", 80);
    updateInventoryUI();
    updateInventoryDisplay();
    updateToolIndicator();
    return false;
  }
}

// Add Save/Load Buttons (with null check)
function addSaveLoadButtons() {
  if (!gameControls) return; // Already checked in init, but good practice

  // Prevent adding multiple times if init is called again
  if (document.getElementById("save-game-btn")) return;

  // Create save button
  const saveButton = document.createElement("button");
  saveButton.textContent = "💾 Save"; // Shorter text
  saveButton.title = "Save Game (Ctrl+S)";
  saveButton.id = "save-game-btn";
  saveButton.className = "game-btn"; // Add class for styling
  saveButton.addEventListener("click", saveGame);

  // Create load button
  const loadButton = document.createElement("button");
  loadButton.textContent = "📂 Load"; // Shorter text
  loadButton.title = "Load Game (Ctrl+L)";
  loadButton.id = "load-game-btn";
  loadButton.className = "game-btn"; // Add class for styling
  loadButton.addEventListener("click", loadGame);

  // Add buttons to UI
  gameControls.appendChild(saveButton);
  gameControls.appendChild(loadButton);

  // Add keyboard shortcuts listener (only once using a flag)
  if (!(window as any).__saveLoadListenerAdded) {
    // Use a flag to prevent multiple listeners
    document.addEventListener("keydown", (event) => {
      // Check if typing in an input field, if so, ignore shortcuts
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        return;
      }

      const keyLower = event.key.toLowerCase();
      const isCtrlOrMeta = event.ctrlKey || event.metaKey; // Ctrl on Win/Linux, Cmd on Mac

      // Ctrl+S to save
      if (keyLower === "s" && isCtrlOrMeta) {
        event.preventDefault(); // Prevent browser save dialog
        saveGame();
      }

      // Ctrl+L to load
      if (keyLower === "l" && isCtrlOrMeta) {
        event.preventDefault(); // Prevent browser load action (if any)
        loadGame();
      }
    });
    (window as any).__saveLoadListenerAdded = true;
  }
}

// --- Updated Resource Spawning ---
function spawnResources(type: string, count: number) {
  if (count <= 0) return;

  // --- UPDATED: Use rock model, remove tree model logic ---
  let modelToClone: THREE.Group | null = null;
  let fallbackGeometry: THREE.BufferGeometry | null = null;
  let fallbackMaterial: THREE.Material | null = null;
  let useProcedural = false;

  if (type === "wood") {
    // Wood type now uses the procedural generator directly
    useProcedural = true;
  } else if (type === "stone") {
    modelToClone = rockModel; // Use the loaded rock model if available
    // Fallback if rock model failed to load
    if (!modelToClone) {
      fallbackGeometry = new THREE.DodecahedronGeometry(0.5, 0); // Simple poly shape
      fallbackMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.8,
      });
    }
  } else {
    console.warn(`Unknown resource type: ${type}`);
    return;
  }

  for (let i = 0; i < count; i++) {
    let resourceObject: THREE.Object3D | null = null; // Initialize as null

    // --- UPDATED: Generate tree or clone rock ---
    if (useProcedural && type === "wood") {
      resourceObject = createLowPolyTree(); // Generate a new tree
    } else if (type === "stone") {
      if (modelToClone) {
        resourceObject = modelToClone.clone(); // Clone the preloaded rock model
        // Apply random rotation to cloned rocks for variety
        resourceObject.rotation.y = Math.random() * Math.PI * 2;
        resourceObject.scale.set(
          THREE.MathUtils.randFloat(0.4, 0.6),
          THREE.MathUtils.randFloat(0.4, 0.6),
          THREE.MathUtils.randFloat(0.4, 0.6),
        );
      } else if (fallbackGeometry && fallbackMaterial) {
        // Use fallback geometry if rock model loading failed
        resourceObject = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
        resourceObject.castShadow = true;
        resourceObject.receiveShadow = true;
        // Random rotation/scale for fallback rocks too
        resourceObject.rotation.y = Math.random() * Math.PI * 2;
        resourceObject.scale.set(
          THREE.MathUtils.randFloat(0.8, 1.2),
          THREE.MathUtils.randFloat(0.8, 1.2),
          THREE.MathUtils.randFloat(0.8, 1.2),
        );
      }
    }

    // If resourceObject couldn't be created, skip this iteration
    if (!resourceObject) {
      console.error(
        `Cannot spawn resource ${type}, no model, fallback, or procedural generator.`,
      );
      continue;
    }

    // Random position within a radius, avoiding center spawn area
    const spawnRadiusMin = 5; // Don't spawn too close to 0,0
    const spawnRadiusMax = 55; // Max distance from center
    const angle = Math.random() * Math.PI * 2;
    const radius = THREE.MathUtils.randFloat(spawnRadiusMin, spawnRadiusMax);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    // Ensure resources spawn on the ground (y=0)
    // The generated tree's base is already at y=0
    // Cloned models might need y adjustment if their origin isn't at the base
    resourceObject.position.set(x, 0, z); // Set position

    // Add the 'userData' property
    resourceObject.userData = { type };

    // Add shadows (already set on model/fallback/generated parts, but safe to re-set/ensure)
    resourceObject.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true;
        // Only trunk and rocks receive shadows well, leaves often look odd
        node.receiveShadow =
          type === "stone" || node.geometry instanceof THREE.CylinderGeometry;
      }
    });

    // Add to scene and resources array (no cast needed, it's Object3D)
    scene.add(resourceObject);
    resources.push(resourceObject);
  }

  // console.log(`Spawned ${count} ${type} resources`);
}

function onWindowResize() {
  // Update camera aspect ratio
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Update renderer size
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Optional: adjust UI elements if needed
  // For example, reposition tool indicators, inventory panels, etc.

  // console.log("Window resized - viewport adjusted");
}
function animate() {
  // DIAGNOSTIC LOG: Check if animate is running
  // console.log("animate() frame"); // Uncomment for verbose logging if needed
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  // Update animations
  if (mixer) mixer.update(delta);

  // Update physics (handles gravity, jump arc, ground collision)
  updatePhysics(delta);

  // Handle movement (player input, camera follow, object move)
  handleMovement(delta);

  // Update placement preview if active
  if (isInPlacementMode) updatePlacementPreview();

  // Render scene (camera position is relative to player)
  // Ensure renderer and scene are valid before rendering
  if (renderer && scene && camera) {
      renderer.render(scene, camera);
  } else {
      console.error("Render call skipped: Renderer, Scene, or Camera not initialized properly.");
      // Optionally stop the loop if this error occurs:
      // return;
  }
}

// --- Updated Physics ---
function updatePhysics(delta: number) {
  // Apply gravity only if not on the ground
  if (!isOnGround) {
    playerVelocity.y -= GRAVITY * delta;
  }

  // Apply velocity to position
  player.position.y += playerVelocity.y * delta;

  // Ground collision check
  if (player.position.y < 0) {
    // Assuming ground is at y=0
    player.position.y = 0;
    playerVelocity.y = 0; // Stop vertical movement

    if (!isOnGround) {
      // Check if we *just* landed
      isOnGround = true;
      isJumping = false; // Can jump again

      // Play landing animation or transition back to idle/run
      // Find appropriate grounded anim (idle if not moving, run/walk otherwise)
      const groundedAnim = findAnimation(
        keys["w"] || keys["s"] ? ["run", "walk"] : ["idle", "stand"],
      );
      if (groundedAnim && currentAnimation !== groundedAnim) {
        playAnimation(groundedAnim, 0.2);
      }
      // console.log("Landed");
    }
  } else {
    // If player is above ground, they are potentially not on the ground
    // A raycast downwards could be more robust for isOnGround checks on uneven terrain
    // For now, assume any Y > 0 means potentially airborne unless just landed
    // isOnGround = false; // Setting this here causes issues, only set false when jumping
  }

  // Optional: Jump height limit (prevent infinite rise if jump held)
  // const maxJumpHeight = jumpStartY + 2.0;
  // if (isJumping && player.position.y >= maxJumpHeight && playerVelocity.y > 0) {
  //     playerVelocity.y = 0; // Stop rising further
  // }
}

function resetGameState() {
  console.log("Resetting game state...");
  // Clean up resources (array of THREE.Object3D)
  resources.forEach((resource) => {
    scene.remove(resource);
    disposeObject3D(resource);
  });
  resources.length = 0; // Clear array

  // Clean up crafted objects (array of THREE.Mesh)
  craftedObjects.forEach((obj) => {
    scene.remove(obj);
    disposeObject3D(obj); // disposeObject3D handles Meshes correctly
  });
  craftedObjects.length = 0; // Clear array

  // Clean up placement preview if exists
  if (placementPreviewObject) {
    scene.remove(placementPreviewObject);
    disposeObject3D(placementPreviewObject);
    placementPreviewObject = null;
  }

  // Reset placement mode
  isInPlacementMode = false;
  placementItemType = null;
  placementIsValid = false;
  supported = false;

  // Reset move mode
  moveMode = false;
  selectedObject = null;

  // Reset inventory counts
  inventory.wood = 0;
  inventory.stone = 0;
  // Add other resources here if needed

  // Reset player inventory items
  playerInventory.fill(null);

  // Reset selected item index
  selectedItemIndex = -1;

  // Reset active tool
  activeToolType = null;

  // Reset player position and physics (optional, good for full reset)
  player.position.set(0, 0, 0);
  player.rotation.set(0, 0, 0);
  playerVelocity.set(0, 0, 0);
  isOnGround = true;
  isJumping = false;

  // Update UI
  updateInventoryUI();
  updateInventoryDisplay();
  updateToolIndicator();

  // Clear messages
  if (messageLog) messageLog.innerHTML = "";
  addMessage("Game state reset.");

  console.log("Game state reset complete.");
}

// Initialize the inventory system (with type safety)
function initInventorySystem() {
  if (!inventoryGrid) {
    console.error("Inventory grid element not found during init!");
    return; // Should have been caught in init() already
  }
  // Create inventory grid slots
  inventoryGrid.innerHTML = ""; // Clear previous slots if any
  for (let i = 0; i < inventorySize; i++) {
    const slot = document.createElement("div");
    slot.className = "inventory-slot";
    // Use index for dataset, useful for debugging/styling
    slot.dataset.index = String(i);

    // Click handler for slots
    slot.addEventListener("click", () => {
      selectInventorySlot(i); // Pass the index directly
    });

    inventoryGrid.appendChild(slot);
  }

  // Update initial inventory display (empty slots)
  updateInventoryDisplay();
}

// Toggle inventory visibility (with null check)
function toggleInventory() {
  if (!inventoryPanel) return;
  const isOpen = inventoryPanel.style.display === "block";
  inventoryPanel.style.display = isOpen ? "none" : "block";
  if (!isOpen) {
    updateInventoryDisplay(); // Refresh display only when opening
    // Deselect item when closing inventory? Optional.
    // if (selectedItemIndex !== -1) {
    //     selectedItemIndex = -1;
    //     addMessage("Deselected item.");
    // }
  }
}

// Close inventory (with null check)
function closeInventory() {
  if (inventoryPanel) {
    inventoryPanel.style.display = "none";
    // Deselect item when closing inventory? Optional.
    // if (selectedItemIndex !== -1) {
    //     selectedItemIndex = -1;
    //     addMessage("Deselected item.");
    //     updateInventoryDisplay();
    // }
  }
}

// Update Move UI (Highlighting)
function updateMoveUI(active: boolean) {
  // Remove highlight from ALL crafted objects first
  craftedObjects.forEach((obj) => {
    // Check material exists and is not an array
    if (obj.material && !Array.isArray(obj.material)) {
      // Check if material has emissive property (common in MeshStandardMaterial/MeshPhysicalMaterial)
      if ("emissive" in obj.material) {
        // Cast to a type that has emissive or use optional chaining if unsure
        (
          obj.material as
            | THREE.MeshStandardMaterial
            | THREE.MeshPhysicalMaterial
        ).emissive?.setHex(0x000000);
      }
    }
  });

  // If activating and an object is selected, add highlight TO THAT OBJECT
  if (active && selectedObject) {
    if (selectedObject.material && !Array.isArray(selectedObject.material)) {
      if ("emissive" in selectedObject.material) {
        (
          selectedObject.material as
            | THREE.MeshStandardMaterial
            | THREE.MeshPhysicalMaterial
        ).emissive?.setHex(0x886633); // Highlight color
      }
    }
  }
}

// Toggle Move Mode
function toggleMoveMode() {
  if (isInPlacementMode) {
    addMessage("Cannot enter move mode while placing an object.", true);
    return;
  }

  if (moveMode) {
    // --- Cancel Move Mode ---
    moveMode = false;
    if (selectedObject) {
      // Access userData safely
      const objectType = selectedObject.userData?.type || "object";
      addMessage(`Cancelled moving ${objectType}.`);
      // Highlight removal is handled by updateMoveUI(false) below
      selectedObject = null; // Deselect
    } else {
      addMessage("Move mode cancelled.");
    }
    updateMoveUI(false); // Remove highlight from all objects
  } else {
    // --- Enter Move Mode ---
    let closestObject: THREE.Mesh | null = null; // Expecting a Mesh
    let closestDistance = Infinity;

    craftedObjects.forEach((obj) => {
      // obj is THREE.Mesh, so .position exists
      const distance = player.position.distanceTo(obj.position);
      // Check distance and ensure it's not the player itself (if player parts were accidentally added)
      if (distance < closestDistance && distance < 5 && obj !== player) {
        closestObject = obj;
        closestDistance = distance;
      }
    });

    if (closestObject) {
      moveMode = true;
      selectedObject = closestObject;
      // Access userData safely
      const objectType = selectedObject.userData?.type || "object";
      addMessage(`Moving ${objectType}. WASD=Move, Enter=Confirm, Esc=Cancel.`);
      updateMoveUI(true); // Add highlight TO THE SELECTED OBJECT
    } else {
      moveMode = false; // Ensure it's false if no object found
      addMessage("No crafted objects nearby to move.");
    }
  }
}

// Handle Movement (Player and Moved Object)
function handleMovement(delta: number) {
  const moveDistance = moveSpeed * delta;
  const playerMoveDirection = new THREE.Vector3();
  const objectMoveDirection = new THREE.Vector3(); // For moving objects

  // --- Player Rotation (Allow always, except when moving an object) ---
  // Handle rotation first, so forward/right vectors are updated before use.
  if (!moveMode) { // Prevent player rotation while actively moving an object
    if (keys["a"]) player.rotation.y += delta * 2.0; // Rotate left
    if (keys["d"]) player.rotation.y -= delta * 2.0; // Rotate right
  }

  // Get player's forward and right directions (based on potentially updated rotation)
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
    player.quaternion,
  );
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(player.quaternion);

  let isPlayerMoving = false; // Tracks if player *translates*
  let isObjectMoving = false;

  // --- Object Movement Input (if in move mode) ---
  if (moveMode && selectedObject) {
    isObjectMoving = true; // Assume moving if in move mode and keys are pressed
    // Use player's view direction for object movement control
    if (keys["w"]) objectMoveDirection.add(forward);
    if (keys["s"]) objectMoveDirection.sub(forward);
    // Use A/D for strafing the object relative to player view
    if (keys["a"]) objectMoveDirection.sub(right);
    if (keys["d"]) objectMoveDirection.add(right);

    if (objectMoveDirection.lengthSq() > 0) {
      objectMoveDirection.normalize();
      // Apply movement directly to the selected object (it's a Mesh)
      selectedObject.position.addScaledVector(
        objectMoveDirection,
        moveDistance,
      );
      // Optional: Add collision detection for the moving object here
      // Optional: Snap to grid while moving?
    } else {
        isObjectMoving = false; // No direction keys pressed for object
    }
  }
  // --- Player Translation Input (if NOT in move mode AND NOT in placement mode) ---
  // This block handles W/S movement. It's skipped if moveMode or isInPlacementMode is true.
  else if (!isInPlacementMode) { // Checks !moveMode implicitly (due to else if) AND !isInPlacementMode
    if (keys["w"]) playerMoveDirection.add(forward);
    if (keys["s"]) playerMoveDirection.sub(forward);
    // A/D rotation is handled above

    if (playerMoveDirection.lengthSq() > 0) {
      // Player is trying to translate
      playerMoveDirection.normalize();

      // Calculate target position
      const targetPosition = player.position
        .clone()
        .addScaledVector(playerMoveDirection, moveDistance);

      // --- Basic Collision Detection ---
      const playerColliderSize = new THREE.Vector3(0.6, 1.7, 0.6);
      const playerColliderOffset = new THREE.Vector3(0, playerColliderSize.y / 2, 0);
      const targetPlayerBox = new THREE.Box3().setFromCenterAndSize(
        targetPosition.clone().add(playerColliderOffset),
        playerColliderSize,
      );

      let collisionOccurred = false;
      for (const obj of craftedObjects) {
        const objBox = new THREE.Box3().setFromObject(obj);
        if (targetPlayerBox.intersectsBox(objBox)) {
          collisionOccurred = true;
          break;
        }
      }
      // Optional: Check against resources
      // ...

      // Apply the position only if no collision occurred
      if (!collisionOccurred) {
        player.position.copy(targetPosition);
        isPlayerMoving = true; // Player successfully translated
      } else {
        // Collision occurred, player did not move forward/backward
        isPlayerMoving = false;
      }
    }
  } // End Player Translation block

  // --- Animation Handling ---
  // (Animation logic remains the same, based on isPlayerMoving, isJumping, etc.)
  if (mixer) {
    let targetAnimationKey: string | null = null;

    // Determine animation based on state (moving, jumping, falling, idle)
    if (isPlayerMoving && isOnGround) { // Check isOnGround for run/walk
      targetAnimationKey = findAnimation(["run", "walk"]);
    } else if (isJumping) {
      targetAnimationKey = findAnimation(["jump_idle", "air", "jump_loop", "jump"]);
    } else if (!isOnGround && playerVelocity.y < -0.1) { // Added threshold for falling anim
      targetAnimationKey = findAnimation(["fall", "falling", "air"]); // Include air as fallback
    } else if (isOnGround) { // Idle only if on ground and not moving/jumping
      targetAnimationKey = findAnimation(["idle", "stand"]);
    }

    // Play the determined animation
    if (targetAnimationKey && currentAnimation !== targetAnimationKey) {
      // Ensure the action exists before playing
      if (playerAnimations[targetAnimationKey]) {
          playAnimation(targetAnimationKey, 0.2);
      } else {
          // Fallback to idle if target animation is missing but should exist
          console.warn(`Target animation "${targetAnimationKey}" not found, attempting idle.`);
          const idleAnim = findAnimation(["idle", "stand"]);
          if (idleAnim && currentAnimation !== idleAnim) playAnimation(idleAnim, 0.3);
      }
    } else if (!targetAnimationKey && currentAnimation !== "idle" && isOnGround) {
      // Explicit fallback to idle if no other state matches and on ground
      const idleAnim = findAnimation(["idle", "stand"]);
      if (idleAnim && currentAnimation !== idleAnim) playAnimation(idleAnim, 0.3);
    }
  }
  // --- End Animation Handling ---
}

// Resource Gathering
function tryGatherResource() {
  let gathered = false;
  for (let i = resources.length - 1; i >= 0; i--) {
    const resource = resources[i]; // Type is THREE.Object3D
    if (!resource?.userData?.type) continue; // Check userData and type exist

    // Calculate distance (2D)
    const playerPos2D = new THREE.Vector2(player.position.x, player.position.z);
    // resource.position exists on Object3D
    const resourcePos = resource.position;
    const resourcePos2D = new THREE.Vector2(resourcePos.x, resourcePos.z);
    const distance = playerPos2D.distanceTo(resourcePos2D);

    if (distance < gatherDistance) {
      const type = resource.userData.type as string;

      // Apply tool effects
      let gatherAmount = 1;
      let toolBonus = "";
      if (activeToolType === "axe" && type === "wood") {
        gatherAmount = 2;
        toolBonus = " (Axe bonus!)";
      }
      // Add other tool effects here (e.g., pickaxe for stone)

      // Ensure inventory type exists before adding
      if (inventory.hasOwnProperty(type)) {
        inventory[type] += gatherAmount;
        addMessage(`Gathered ${gatherAmount} ${type}${toolBonus}!`);
      } else {
        console.warn(
          `Gathered resource type "${type}" which is not tracked in inventory object.`,
        );
        addMessage(`Gathered unknown resource: ${type}`);
      }

      // Remove and dispose
      scene.remove(resource);
      disposeObject3D(resource); // Use helper to dispose geometry/material
      resources.splice(i, 1);

      updateInventoryUI();
      gathered = true;
      break; // Gather only one resource per key press
    }
  }
  if (!gathered) {
    // Optional: addMessage("No resources nearby to gather.");
  }
}

// --- Final Cleanup ---
// Add cleanup for placement materials and other assets
function cleanupGameAssets() {
  console.log("Cleaning up game assets...");
  // Dispose shared placement materials
  disposeMaterial(placementMaterialValid);
  disposeMaterial(placementMaterialInvalid);

  // Dispose scene objects during reset or full cleanup
  resetGameState(); // Calls disposeObject3D for resources/crafted items

  // Dispose renderer, scene, camera if needed for full teardown
  renderer?.dispose();
  // Let garbage collector handle scene contents if resetGameState cleaned them
  // scene = null; // Avoid setting to null if you might re-init
  // camera = null; // Avoid setting to null
  mixer = null; // Clear mixer reference

  // Remove event listeners
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("keyup", handleKeyUp);
  window.removeEventListener("resize", onWindowResize);
  if ((window as any).__saveLoadListenerAdded) {
    // Need to store the listener function itself to remove it,
    // or just let it be (usually harmless if the game context is gone)
    console.warn("Save/Load keydown listener not explicitly removed.");
  }

  console.log("Game assets cleanup finished.");
}

// Call init on window load
window.onload = () => {
  init(); // Now async
};

// Optional: Add beforeunload listener (can be unreliable, use for saving maybe)
// window.addEventListener('beforeunload', (event) => {
//     // Attempt to save game? Risky, might not complete.
//     // saveGame();
//     // Standard practice for preventing accidental closure:
//     // event.preventDefault(); // Standard way, might not work in all browsers
//     // event.returnValue = ''; // Legacy way
// });

// Optional: Full cleanup if the page is truly being left
// window.addEventListener('unload', cleanupGameAssets); // Even less reliable than beforeunload
