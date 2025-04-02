// --- Basic Setup ---
let scene, camera, renderer, player, clock;
let moveMode = false;
let selectedObject = null;
const moveSpeed = 8.0;
const keys = {}; // Keep track of pressed keys
const resources = []; // Store collectible resource objects (now groups)
const craftedObjects = []; // Store placed objects like huts
const inventory = { wood: 0, stone: 0, axe: 0, hut: 0 };
const gatherDistance = 2.0; // Slightly increased gather distance for larger models
const inventorySize = 20; // 6x4 grid
const playerInventory = []; // Array to store inventory items
let selectedItemIndex = -1;
let activeToolType = null; // Tracks currently active tool

// Items definitions
const itemDefinitions = {
  axe: {
    name: "Wooden Axe",
    description: "A simple axe for chopping trees faster.",
    icon: "🪓", // Can be replaced with actual image URL
    width: 1,
    height: 2,
    effect: "increases wood gathering by 2x",
  },
  hut: {
    name: "Small Hut",
    description: "A basic shelter to keep you safe.",
    icon: "🏠", // Can be replaced with actual image URL
    width: 2,
    height: 2,
    placeable: true,
  },
};

// Crafting Recipes
const recipes = {
  axe: { wood: 5, stone: 2 },
  hut: { wood: 10, stone: 5 },
};

function createToolIndicator() {
  const toolIndicator = document.createElement("div");
  toolIndicator.id = "active-tool-indicator";
  toolIndicator.innerHTML = `
    <div class="indicator-icon">🔄</div>
    <div class="indicator-text">No Tool</div>
  `;
  toolIndicator.style.display = "none"; // Hide initially
  document.body.appendChild(toolIndicator);

  // Add CSS for this in your stylesheet or inline here
  const style = document.createElement("style");
  style.textContent = `
    #active-tool-indicator {
      position: fixed;
      top: 70px;
      right: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px 12px;
      border-radius: 5px;
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 1000;
    }
    .indicator-icon {
      font-size: 24px;
    }
    .indicator-text {
      font-size: 16px;
      font-weight: bold;
    }
  `;
  document.head.appendChild(style);
}

function updateToolIndicator() {
  const indicator = document.getElementById("active-tool-indicator");

  if (!activeToolType) {
    indicator.style.display = "none";
    return;
  }

  const toolDef = itemDefinitions[activeToolType];
  if (!toolDef) {
    indicator.style.display = "none";
    return;
  }

  // Show the indicator with the tool info
  indicator.style.display = "flex";
  indicator.querySelector(".indicator-icon").textContent = toolDef.icon;
  indicator.querySelector(".indicator-text").textContent = toolDef.name;
}

// Initialize the inventory system
function initInventorySystem() {
  // Create inventory grid
  const grid = document.querySelector(".inventory-grid");
  for (let i = 0; i < inventorySize; i++) {
    const slot = document.createElement("div");
    slot.className = "inventory-slot";
    slot.dataset.index = i;

    // Click handler for slots
    slot.addEventListener("click", () => {
      selectInventorySlot(i);
    });

    grid.appendChild(slot);
  }

  // Set up event listeners
  document
    .getElementById("show-inventory-btn")
    .addEventListener("click", toggleInventory);
  document
    .getElementById("close-inventory")
    .addEventListener("click", closeInventory);

  // Also allow 'I' key to toggle inventory
  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "i") {
      toggleInventory();
    }

    // Use selected item with 'U' key
    if (event.key.toLowerCase() === "u" && selectedItemIndex >= 0) {
      useSelectedItem();
    }
  });

  // Update initial inventory display
  updateInventoryDisplay();
}

// Toggle inventory visibility
function toggleInventory() {
  const inventoryPanel = document.getElementById("inventory-panel");
  if (inventoryPanel.style.display === "none") {
    inventoryPanel.style.display = "block";
    updateInventoryDisplay(); // Refresh display
  } else {
    inventoryPanel.style.display = "none";
  }
}

function closeInventory() {
  document.getElementById("inventory-panel").style.display = "none";
}

// Update the visual display of the inventory
function updateInventoryDisplay() {
  const slots = document.querySelectorAll(".inventory-slot");

  // Clear all slots first
  slots.forEach((slot) => {
    slot.innerHTML = "";
    slot.classList.remove("occupied", "selected");
  });

  // Fill slots with items
  playerInventory.forEach((item, index) => {
    if (!item) return;

    const slot = slots[index];
    slot.classList.add("occupied");

    if (index === selectedItemIndex) {
      slot.classList.add("selected");
    }

    // Create item display
    const itemDef = itemDefinitions[item.type];

    // Create icon (text or image)
    if (itemDef.icon.startsWith("http")) {
      // It's an image URL
      const img = document.createElement("img");
      img.src = itemDef.icon;
      img.alt = itemDef.name;
      slot.appendChild(img);
    } else {
      // It's an emoji or text
      const icon = document.createElement("div");
      icon.style.fontSize = "24px";
      icon.textContent = itemDef.icon;
      slot.appendChild(icon);
    }

    // Create tooltip
    const tooltip = document.createElement("div");
    tooltip.className = "item-tooltip";

    const nameElement = document.createElement("div");
    nameElement.className = "item-name";
    nameElement.textContent = itemDef.name;
    tooltip.appendChild(nameElement);

    const descElement = document.createElement("div");
    descElement.className = "item-description";
    descElement.textContent = itemDef.description;
    tooltip.appendChild(descElement);

    if (itemDef.effect) {
      const effectElement = document.createElement("div");
      effectElement.className = "item-description";
      effectElement.textContent = `Effect: ${itemDef.effect}`;
      tooltip.appendChild(effectElement);
    }

    slot.appendChild(tooltip);
  });
}

// Select an inventory slot
function selectInventorySlot(index) {
  if (playerInventory[index]) {
    // Toggle selection
    if (selectedItemIndex === index) {
      selectedItemIndex = -1; // Deselect
    } else {
      selectedItemIndex = index;
    }

    // Show what item was selected
    if (selectedItemIndex >= 0) {
      const item = playerInventory[selectedItemIndex];
      const itemDef = itemDefinitions[item.type];
      addMessage(`Selected: ${itemDef.name}. Press 'U' to use.`);
    }

    updateInventoryDisplay();
  }
}

// Use the selected item
function useSelectedItem() {
  if (selectedItemIndex < 0 || !playerInventory[selectedItemIndex]) return;

  const item = playerInventory[selectedItemIndex];
  const itemDef = itemDefinitions[item.type];

  if (itemDef.placeable) {
    // Placeable items (like huts)
    placeHut(); // Using existing placement function
    addMessage(`Placed ${itemDef.name}`);

    // Remove from inventory after placing
    playerInventory[selectedItemIndex] = null;
    selectedItemIndex = -1;
  } else {
    // Tool activation logic
    if (activeToolType === item.type) {
      // Tool is already active, deactivate it
      activeToolType = null;
      addMessage(`${itemDef.name} deactivated`);
    } else {
      // Activate the tool
      activeToolType = item.type;
      addMessage(`${itemDef.name} activated`);
    }
    updateToolIndicator();
  }

  updateInventoryDisplay();
}

// Add item to inventory (modified from existing craft function)
function addItemToInventory(itemType) {
  // Find first empty slot
  const emptySlot = playerInventory.findIndex(
    (slot) => slot === null || slot === undefined,
  );

  if (emptySlot >= 0 || playerInventory.length < inventorySize) {
    const newItem = { type: itemType };

    if (emptySlot >= 0) {
      playerInventory[emptySlot] = newItem;
    } else {
      playerInventory.push(newItem);
    }

    addMessage(`Added ${itemDefinitions[itemType].name} to inventory`);
    updateInventoryDisplay();
    return true;
  } else {
    addMessage("Inventory is full!");
    return false;
  }
}

// Modify the existing craft functions to use the new inventory
function craftItem(itemName) {
  const recipe = recipes[itemName];
  if (!recipe) {
    addMessage(`Unknown recipe: ${itemName}`);
    return;
  }

  // Check if player has enough resources
  let canCraft = true;
  for (const resourceType in recipe) {
    if (inventory[resourceType] < recipe[resourceType]) {
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
      addMessage(`Crafted 1 ${itemName}!`);
    } else {
      // Refund resources if inventory is full
      for (const resourceType in recipe) {
        inventory[resourceType] += recipe[resourceType];
      }
    }

    updateInventoryUI(); // Update the resources display
  }
}

// For the cheat code, modify to use new inventory
function cheatCreateHut() {
  addItemToInventory("hut");
}

// --- Initialization ---
function init() {
  createToolIndicator();
  initInventorySystem();
  addSaveLoadButtons();
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Sky blue background
  scene.fog = new THREE.Fog(0x87ceeb, 15, 60); // Adjusted fog

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(0, 1.7, 5); // Positioned slightly above ground, looking forward
  camera.lookAt(0, 1, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("canvas"),
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true; // Enable shadows
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows

  // Clock for delta time
  clock = new THREE.Clock();

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Soft ambient light
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9); // Slightly brighter Sun light
  directionalLight.position.set(15, 20, 10); // Adjusted position
  directionalLight.castShadow = true;
  // Configure shadow properties
  directionalLight.shadow.mapSize.width = 1024; // Keep reasonable shadow map size
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 60; // Match fog distance
  directionalLight.shadow.camera.left = -30; // Increase shadow area
  directionalLight.shadow.camera.right = 30;
  directionalLight.shadow.camera.top = 30;
  directionalLight.shadow.camera.bottom = -30;
  scene.add(directionalLight);
  // Optional: Add a light helper to visualize direction
  // const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
  // scene.add(lightHelper);
  // const shadowCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
  // scene.add(shadowCameraHelper);

  // Ground
  const groundGeometry = new THREE.PlaneGeometry(120, 120); // Larger ground
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x228b22,
    side: THREE.DoubleSide,
  }); // Forest green
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2; // Rotate to be flat
  ground.receiveShadow = true; // Allow ground to receive shadows
  scene.add(ground);

  // Player (simple cube)
  const playerGeometry = new THREE.BoxGeometry(0.5, 1.8, 0.5); // Approx human height
  const playerMaterial = new THREE.MeshStandardMaterial({
    color: 0x0000ff,
  }); // Blue player
  player = new THREE.Mesh(playerGeometry, playerMaterial);
  player.position.y = 0.9; // Position player slightly above ground base
  player.castShadow = true;
  scene.add(player);

  // Spawn initial resources
  spawnResources("wood", 100); // More trees
  spawnResources("stone", 80); // More rocks

  // Event Listeners
  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("keydown", (event) => {
    keys[event.key.toLowerCase()] = true;

    // Cheat code: Shift+H to instantly create a hut
    if (event.key.toLowerCase() === "h" && event.shiftKey) {
      cheatCreateHut();
      addMessage("🔮 CHEAT ACTIVATED: Free hut created!");
    }

    // Press 'M' to toggle move mode
    if (event.key.toLowerCase() === "m") {
      toggleMoveMode();
    }

    // In move mode, press 'Enter' to place the selected object
    if (event.key === "Enter" && moveMode && selectedObject) {
      moveMode = false;
      selectedObject = null;
      addMessage("Hut placement confirmed!");
      updateMoveUI(false);
    }
  });

  // Add these new functions to handle moving huts
  function toggleMoveMode() {
    moveMode = !moveMode;

    if (moveMode) {
      // Enter move mode - try to select the closest hut
      selectClosestHut();
    } else {
      // Exit move mode
      selectedObject = null;
    }

    updateMoveUI(moveMode);
  }

  function selectClosestHut() {
    let closestDistance = Infinity;
    let closestHut = null;

    for (let i = 0; i < craftedObjects.length; i++) {
      const object = craftedObjects[i];
      // Only consider huts (you could add a type check if you have multiple object types)

      const distance = player.position.distanceTo(object.position);
      if (distance < closestDistance && distance < 10) {
        // Only select if within 10 units
        closestDistance = distance;
        closestHut = object;
      }
    }

    if (closestHut) {
      selectedObject = closestHut;
      addMessage(
        "Hut selected for moving. Use WASD to position, Enter to place.",
      );
    } else {
      addMessage("No huts found nearby to move.");
      moveMode = false;
    }
  }

  // Add this new function for the cheat
  function cheatCreateHut() {
    // Add hut to inventory
    inventory["hut"]++;
    updateInventoryUI();

    // Also place the hut in front of the player
    placeHut();
  }
  document.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;
    if (event.key.toLowerCase() === "e") {
      tryGatherResource();
    }
  });

  // Crafting Button Listeners
  document
    .getElementById("craft-axe")
    .addEventListener("click", () => craftItem("axe"));
  document
    .getElementById("craft-hut")
    .addEventListener("click", () => craftItem("hut"));

  // Start the game loop
  animate();
  updateInventoryUI(); // Initial UI update
  addMessage("Game started. Find resources!");
}

// Add this function to update UI when in move mode
function updateMoveUI(active) {
  if (active) {
    addMessage("MOVE MODE: Use WASD to position hut, Enter to confirm.");
    // Optionally add visual indicator like highlighting the selected hut
    if (selectedObject) {
      // You could add a highlight effect here
      selectedObject.material.emissive = new THREE.Color(0x553311);
    }
  } else {
    addMessage("Move mode deactivated.");
    // Remove any visual indicators
    if (selectedObject) {
      selectedObject.material.emissive = new THREE.Color(0x000000);
    }
  }
}

// --- Resource Spawning ---
function spawnResources(type, count) {
  const spread = 100; // How far resources spread from center

  for (let i = 0; i < count; i++) {
    let resourceObject; // This will be the Mesh or Group

    if (type === "wood") {
      // Create a Tree (Group of trunk and leaves)
      const tree = new THREE.Group();

      // Trunk
      const trunkHeight = Math.random() * 2 + 1.5; // Random height
      const trunkRadius = 0.2 + Math.random() * 0.1;
      const trunkGeometry = new THREE.CylinderGeometry(
        trunkRadius * 0.8,
        trunkRadius,
        trunkHeight,
        8,
      );
      const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b4513,
      }); // Brown
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.castShadow = true;
      trunk.receiveShadow = true; // Trunk can receive shadow from leaves
      trunk.position.y = trunkHeight / 2; // Base at y=0
      tree.add(trunk);

      // Leaves (simple cone)
      const leavesHeight = trunkHeight * 1.5 + Math.random() * 0.5;
      const leavesRadius = trunkRadius * 4 + Math.random() * 1;
      const leavesGeometry = new THREE.ConeGeometry(
        leavesRadius,
        leavesHeight,
        8,
      );
      const leavesMaterial = new THREE.MeshStandardMaterial({
        color: 0x2e8b57,
      }); // Sea green
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.castShadow = true;
      leaves.position.y = trunkHeight + leavesHeight * 0.4; // Position above trunk
      tree.add(leaves);

      resourceObject = tree;
      resourceObject.position.y = 0; // Group's base is at ground level
    } else {
      // Stone
      // Create a Rock (Jagged shape)
      const rockRadius = 0.4 + Math.random() * 0.3;
      // IcosahedronGeometry gives a more jagged look than Sphere
      const rockGeometry = new THREE.IcosahedronGeometry(rockRadius, 0); // Detail level 0 for fewer faces
      const rockMaterial = new THREE.MeshStandardMaterial({
        color: 0x808080,
        flatShading: true,
      }); // Grey, flat shading emphasizes facets
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      rock.castShadow = true;
      rock.receiveShadow = true; // Rocks can receive shadows
      resourceObject = rock;
      resourceObject.position.y = rockRadius * 0.8; // Position slightly above ground based on radius
    }

    // Set position and add to scene/array
    resourceObject.position.x = (Math.random() - 0.5) * spread;
    resourceObject.position.z = (Math.random() - 0.5) * spread;

    // Ensure resources don't spawn too close to the center (player start)
    if (resourceObject.position.length() < 5) {
      resourceObject.position.setLength(5 + Math.random() * (spread / 2 - 5)); // Move it further out
    }

    resourceObject.userData = { type: type }; // Store resource type in the group/mesh
    scene.add(resourceObject);
    resources.push(resourceObject);
  }
}

// --- Game Loop ---
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta(); // Time since last frame

  handleMovement(delta);

  renderer.render(scene, camera);
}

// --- Player Movement ---
function handleMovement(delta) {
  const moveDistance = moveSpeed * delta;
  const moveDirection = new THREE.Vector3();

  // Get forward/backward direction based on camera
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0; // Keep movement horizontal
  forward.normalize();

  // Get right/left direction (strafe)
  const right = new THREE.Vector3();
  right.crossVectors(camera.up, forward).normalize(); // Right is perpendicular to up and forward

  if (moveMode && selectedObject) {
    // Move the selected object instead of the player
    if (keys["w"]) moveDirection.add(forward);
    if (keys["s"]) moveDirection.sub(forward);
    if (keys["a"]) moveDirection.sub(right);
    if (keys["d"]) moveDirection.add(right);

    // Move the selected object
    if (moveDirection.lengthSq() > 0) {
      moveDirection.normalize();
      selectedObject.position.addScaledVector(moveDirection, moveDistance);
    }
  } else {
    // Normal player movement (existing code)
    if (keys["w"]) moveDirection.add(forward);
    if (keys["s"]) moveDirection.sub(forward);
    if (keys["a"]) moveDirection.add(right);
    if (keys["d"]) moveDirection.sub(right);

    // Normalize diagonal movement to prevent faster speed
    if (moveDirection.lengthSq() > 0) {
      moveDirection.normalize();
      player.position.addScaledVector(moveDirection, moveDistance);

      // Camera following logic (existing code)
      const cameraOffsetBehind = 3;
      const cameraOffsetY = 0.7;
      const cameraTargetPosition = player.position.clone();
      cameraTargetPosition.addScaledVector(
        forward.negate(),
        cameraOffsetBehind,
      );
      cameraTargetPosition.y = player.position.y + cameraOffsetY;
      camera.position.lerp(cameraTargetPosition, 0.15);
      camera.lookAt(
        player.position.x,
        player.position.y + 0.5,
        player.position.z,
      );
    }
  }
}

// --- Save/Load Game Functions ---
function saveGame() {
  // Create a game state object to store all important data
  const gameState = {
    inventory: inventory,
    playerInventory: playerInventory,
    playerPosition: {
      x: player.position.x,
      y: player.position.y,
      z: player.position.z,
    },
    resources: resources.map((resource) => ({
      type: resource.userData.type,
      position: {
        x: resource.position.x,
        y: resource.position.y,
        z: resource.position.z,
      },
    })),
    craftedObjects: craftedObjects.map((obj) => ({
      // Assuming these are huts for now
      type: "hut",
      position: {
        x: obj.position.x,
        y: obj.position.y,
        z: obj.position.z,
      },
    })),
    activeToolType: activeToolType,
    selectedItemIndex: selectedItemIndex,
  };

  // Save to localStorage
  try {
    localStorage.setItem("gemGameSave", JSON.stringify(gameState));
    addMessage("Game saved successfully!");
    showSaveNotification("Game saved successfully!");
  } catch (e) {
    console.error("Failed to save game:", e);
    addMessage("Failed to save game. Error: " + e.message);
    showSaveNotification("Failed to save game!", true);
  }
}

function loadGame() {
  try {
    const savedData = localStorage.getItem("gemGameSave");
    if (!savedData) {
      addMessage("No saved game found.");
      showSaveNotification("No saved game found!", true);
      return false;
    }

    const gameState = JSON.parse(savedData);

    // 1. Reset the current game state
    resetGameState();

    // 2. Load inventory
    Object.assign(inventory, gameState.inventory);

    // 3. Load player inventory items
    gameState.playerInventory.forEach((item, index) => {
      playerInventory[index] = item;
    });
    selectedItemIndex = gameState.selectedItemIndex;
    activeToolType = gameState.activeToolType;
    updateToolIndicator();

    // 4. Set player position
    player.position.set(
      gameState.playerPosition.x,
      gameState.playerPosition.y,
      gameState.playerPosition.z,
    );

    // 5. Spawn resources
    gameState.resources.forEach((resourceData) => {
      spawnResourceAtPosition(
        resourceData.type,
        resourceData.position.x,
        resourceData.position.y,
        resourceData.position.z,
      );
    });

    // 6. Recreate crafted objects (like huts)
    gameState.craftedObjects.forEach((objData) => {
      if (objData.type === "hut") {
        createHutAtPosition(
          objData.position.x,
          objData.position.y,
          objData.position.z,
        );
      }
    });

    // 7. Update UI
    updateInventoryUI();
    updateInventoryDisplay();

    addMessage("Game loaded successfully!");
    showSaveNotification("Game loaded successfully!");
    return true;
  } catch (e) {
    console.error("Failed to load game:", e);
    addMessage("Failed to load game. Error: " + e.message);
    showSaveNotification("Failed to load game!", true);
    return false;
  }
}

// Helper function to reset the current game state
function resetGameState() {
  // Clear current resources
  resources.forEach((resource) => {
    scene.remove(resource);
    // Dispose of geometries and materials
    if (resource.isGroup) {
      resource.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (child.material.isMaterial) {
            child.material.dispose();
          } else {
            child.material.forEach((material) => material.dispose());
          }
        }
      });
    } else if (resource.isMesh) {
      resource.geometry.dispose();
      if (resource.material.isMaterial) {
        resource.material.dispose();
      } else {
        resource.material.forEach((material) => material.dispose());
      }
    }
  });
  resources.length = 0;

  // Clear crafted objects
  craftedObjects.forEach((obj) => {
    scene.remove(obj);
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (obj.material.isMaterial) {
        obj.material.dispose();
      } else {
        obj.material.forEach((material) => material.dispose());
      }
    }
  });
  craftedObjects.length = 0;

  // Reset inventory and player inventory
  for (const key in inventory) {
    inventory[key] = 0;
  }
  playerInventory.length = 0;

  // Reset tool
  activeToolType = null;
  updateToolIndicator();

  // Reset selection
  selectedItemIndex = -1;
}

// Helper function to spawn a resource at a specific position
function spawnResourceAtPosition(type, x, y, z) {
  let resourceObject;

  if (type === "wood") {
    // Create a Tree (Group of trunk and leaves)
    const tree = new THREE.Group();

    // Trunk
    const trunkHeight = Math.random() * 2 + 1.5; // Random height
    const trunkRadius = 0.2 + Math.random() * 0.1;
    const trunkGeometry = new THREE.CylinderGeometry(
      trunkRadius * 0.8,
      trunkRadius,
      trunkHeight,
      8,
    );
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 }); // Brown
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    trunk.position.y = trunkHeight / 2;
    tree.add(trunk);

    // Leaves (simple cone)
    const leavesHeight = trunkHeight * 1.5 + Math.random() * 0.5;
    const leavesRadius = trunkRadius * 4 + Math.random() * 1;
    const leavesGeometry = new THREE.ConeGeometry(
      leavesRadius,
      leavesHeight,
      8,
    );
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x2e8b57 }); // Sea green
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.castShadow = true;
    leaves.position.y = trunkHeight + leavesHeight * 0.4;
    tree.add(leaves);

    resourceObject = tree;
  } else {
    // Stone
    const rockRadius = 0.4 + Math.random() * 0.3;
    const rockGeometry = new THREE.IcosahedronGeometry(rockRadius, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080,
      flatShading: true,
    });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.castShadow = true;
    rock.receiveShadow = true;
    resourceObject = rock;
    resourceObject.position.y = rockRadius * 0.8;
  }

  // Set position
  resourceObject.position.x = x;
  resourceObject.position.y = y;
  resourceObject.position.z = z;

  resourceObject.userData = { type: type };
  scene.add(resourceObject);
  resources.push(resourceObject);

  return resourceObject;
}

// Helper function to create a hut at a specific position
function createHutAtPosition(x, y, z) {
  const hutGeometry = new THREE.BoxGeometry(3, 2, 3);
  const hutMaterial = new THREE.MeshStandardMaterial({ color: 0xd2b48c }); // Tan
  const hut = new THREE.Mesh(hutGeometry, hutMaterial);

  hut.position.set(x, y, z);
  hut.castShadow = true;
  hut.receiveShadow = true;

  scene.add(hut);
  craftedObjects.push(hut);

  return hut;
}

// UI notification for save/load
function showSaveNotification(message, isError = false) {
  // Check if notification element exists, create if not
  let notification = document.getElementById("save-notification");
  if (!notification) {
    notification = document.createElement("div");
    notification.id = "save-notification";
    document.body.appendChild(notification);

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
      #save-notification {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s;
      }
      #save-notification.success {
        border-left: 4px solid #4CAF50;
      }
      #save-notification.error {
        border-left: 4px solid #F44336;
      }
      #save-notification.visible {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }

  // Set message and show notification
  notification.textContent = message;
  notification.className = isError ? "error" : "success";
  notification.classList.add("visible");

  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove("visible");
  }, 3000);
}

// Add to init() function:
function addSaveLoadButtons() {
  const gameControls = document.querySelector(".game-controls");

  // Create save button
  const saveButton = document.createElement("button");
  saveButton.textContent = "💾 Save Game";
  saveButton.id = "save-game-btn";
  saveButton.className = "game-btn";
  saveButton.addEventListener("click", saveGame);

  // Create load button
  const loadButton = document.createElement("button");
  loadButton.textContent = "📂 Load Game";
  loadButton.id = "load-game-btn";
  loadButton.className = "game-btn";
  loadButton.addEventListener("click", loadGame);

  // Add buttons to UI
  gameControls.appendChild(saveButton);
  gameControls.appendChild(loadButton);

  // Add keyboard shortcuts
  document.addEventListener("keydown", (event) => {
    // Ctrl+S to save
    if (event.key.toLowerCase() === "s" && event.ctrlKey) {
      event.preventDefault(); // Prevent browser save dialog
      saveGame();
    }

    // Ctrl+L to load
    if (event.key.toLowerCase() === "l" && event.ctrlKey) {
      event.preventDefault();
      loadGame();
    }
  });
}

// --- Resource Gathering ---
function tryGatherResource() {
  let gathered = false;
  for (let i = resources.length - 1; i >= 0; i--) {
    const resource = resources[i];
    // Calculate distance ignoring Y axis for simpler ground-based check
    const playerPos2D = new THREE.Vector2(player.position.x, player.position.z);
    const resourcePos2D = new THREE.Vector2(
      resource.position.x,
      resource.position.z,
    );
    const distance = playerPos2D.distanceTo(resourcePos2D);

    if (distance < gatherDistance) {
      const type = resource.userData.type;

      // Apply tool effects
      let gatherAmount = 1;
      let toolBonus = "";

      // If axe is active and gathering wood
      if (activeToolType === "axe" && type === "wood") {
        gatherAmount = 2; // Double the wood gathered
        toolBonus = " (Axe bonus!)";
      }

      inventory[type] += gatherAmount;
      addMessage(`Gathered ${gatherAmount} ${type}${toolBonus}!`);

      scene.remove(resource); // Remove from scene
      // If it's a group (like a tree), recursively dispose of geometry/material
      if (resource.isGroup) {
        resource.traverse((child) => {
          if (child.isMesh) {
            child.geometry.dispose();
            if (child.material.isMaterial) {
              child.material.dispose();
            } else {
              // Array of materials
              child.material.forEach((material) => material.dispose());
            }
          }
        });
      } else if (resource.isMesh) {
        // Single mesh like a rock
        resource.geometry.dispose();
        if (resource.material.isMaterial) {
          resource.material.dispose();
        } else {
          resource.material.forEach((material) => material.dispose());
        }
      }
      resources.splice(i, 1); // Remove from array
      updateInventoryUI();
      gathered = true;
      break; // Gather only one resource per key press
    }
  }
  if (!gathered) {
    // Optional: Add message if E is pressed but nothing is nearby
    // addMessage("No resources nearby to gather.");
  }
}

// --- Placing Structures (Example - currently not called automatically) ---
function placeHut() {
  // Simple placement in front of player
  const hutGeometry = new THREE.BoxGeometry(3, 2, 3);
  const hutMaterial = new THREE.MeshStandardMaterial({
    color: 0xd2b48c,
  }); // Tan
  const hut = new THREE.Mesh(hutGeometry, hutMaterial);

  const forward = new THREE.Vector3();
  player.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  const placementOffset = 4; // Place slightly further
  hut.position.copy(player.position).addScaledVector(forward, placementOffset);
  hut.position.y = 1; // Base on ground

  hut.castShadow = true;
  hut.receiveShadow = true;
  scene.add(hut);
  craftedObjects.push(hut);
  addMessage("Placed Hut!");
  // Decide if inventory['hut'] should be consumed upon placement
  // inventory['hut']--;
  // updateInventoryUI();
}

// --- UI Updates ---
function updateInventoryUI() {
  document.getElementById("inv-wood").textContent = `Wood: ${inventory.wood}`;
  document.getElementById("inv-stone").textContent =
    `Stone: ${inventory.stone}`;

  const axeInv = document.getElementById("inv-axe");
  const hutInv = document.getElementById("inv-hut");
  axeInv.style.display = inventory.axe > 0 ? "block" : "none";
  hutInv.style.display = inventory.hut > 0 ? "block" : "none";

  // Disable craft buttons if resources are insufficient
  for (const itemName in recipes) {
    const button = document.getElementById(`craft-${itemName}`);
    if (button) {
      let canCraft = true;
      const recipe = recipes[itemName];
      for (const resourceType in recipe) {
        if (inventory[resourceType] < recipe[resourceType]) {
          canCraft = false;
          break;
        }
      }
      button.disabled = !canCraft;
    }
  }
}

function addMessage(text) {
  const messageLog = document.getElementById("message-log");
  const p = document.createElement("p");
  p.textContent = `> ${text}`;
  // Prepend new messages to the top
  messageLog.insertBefore(p, messageLog.firstChild);

  // Limit number of messages by removing the oldest ones from the bottom
  const maxMessages = 7;
  while (messageLog.children.length > maxMessages) {
    messageLog.removeChild(messageLog.lastChild);
  }
}

// --- Window Resize ---
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Start ---
// Use window.onload to ensure everything including fonts is ready
window.onload = function () {
  init();
};
