// --- Basic Setup ---
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Type declarations for HTML elements
const invWoodEl = document.getElementById("inv-wood") as HTMLElement;
const invStoneEl = document.getElementById("inv-stone") as HTMLElement;
const axeInvEl = document.getElementById("inv-axe") as HTMLElement;
const hutInvEl = document.getElementById("inv-hut") as HTMLElement;
const messageLogEl = document.getElementById("message-log") as HTMLElement;

let scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  player: THREE.Group,
  clock: THREE.Clock;
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

let mixer: THREE.AnimationMixer;
let playerAnimations: { [key: string]: THREE.AnimationAction } = {}; // Animation actions
let currentAnimation: string = "idle"; // Currently playing animation
// Jump physics variables
const GRAVITY = 9.8; // acceleration due to gravity
const JUMP_FORCE = 5.0; // initial jump velocity
let playerVelocity = new THREE.Vector3(0, 0, 0);
let isOnGround = true;
let isJumping = false;
let jumpStartY = 0; // track the y-position when jump started
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

// Initiate a jump
function startJump() {
  if (isOnGround) {
    isJumping = true;
    isOnGround = false;
    jumpStartY = player.position.y;
    playerVelocity.y = JUMP_FORCE;

    // Play jump animation
    const jumpAnim = findAnimation(["jump", "leap"]);
    if (jumpAnim) {
      playAnimation(jumpAnim, 0.1);
    }

    addMessage("Jumped!");
  }
}

// Apply gravity and handle landing
function updateJump(delta) {
  if (!isOnGround) {
    // Apply gravity
    playerVelocity.y -= GRAVITY * delta;

    // Update position
    player.position.y += playerVelocity.y * delta;

    // Check for landing (ground is at y=0)
    if (player.position.y <= 0) {
      player.position.y = 0; // Snap to ground
      playerVelocity.y = 0;
      isOnGround = true;
      isJumping = false;

      // Play landing animation if available, otherwise idle
      const landAnim = findAnimation(["land", "landing"]);
      if (landAnim) {
        playAnimation(landAnim, 0.1);

        // Switch back to idle after landing animation finishes
        if (mixer && playerAnimations[landAnim]) {
          const duration = playerAnimations[landAnim]._clip.duration;
          setTimeout(() => {
            if (!keys["w"] && !keys["a"] && !keys["s"] && !keys["d"]) {
              const idleAnim = findAnimation(["idle", "stand"]);
              if (idleAnim) playAnimation(idleAnim, 0.3);
            }
          }, duration * 800); // Slightly shorter than full duration
        }
      } else {
        // No landing animation, go straight to idle
        if (!keys["w"] && !keys["a"] && !keys["s"] && !keys["d"]) {
          const idleAnim = findAnimation(["idle", "stand"]);
          if (idleAnim) playAnimation(idleAnim, 0.3);
        }
      }
    }
  }
}

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

function loadPlayerModel(modelPath) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();

    loader.load(
      modelPath,
      (gltf) => {
        // Success callback
        const model = gltf.scene;
        model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
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
            const name = clip.name.toLowerCase().replace(/\s+/g, "_");
            playerAnimations[name] = mixer.clipAction(clip);
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
          createAnimationDebugUI();
        }
        resolve(model);
      },
      // Progress callback
      (xhr) => {
        console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
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

  const debugPanel = document.createElement("div");
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
    const match = Object.keys(playerAnimations).find((name) =>
      name.includes(keyword),
    );
    if (match) return match;
  }

  return null;
}

// Play animation with crossfade
function playAnimation(name: string, duration: number = 0.5) {
  if (!playerAnimations[name]) {
    console.warn(`Animation "${name}" not found!`);
    return false;
  }

  if (currentAnimation === name) return true;

  const action = playerAnimations[name];

  if (currentAnimation && playerAnimations[currentAnimation]) {
    playerAnimations[currentAnimation].fadeOut(duration);
  }

  action.reset().fadeIn(duration).play();
  currentAnimation = name;

  console.log(`Playing animation: ${name}`);
  return true;
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

  const tempGeometry = new THREE.BoxGeometry(0.5, 1.8, 0.5);
  const tempMaterial = new THREE.MeshStandardMaterial({
    color: 0x0000ff,
    transparent: true,
    opacity: 0.5,
  });
  player = new THREE.Group();
  const tempCube = new THREE.Mesh(tempGeometry, tempMaterial);
  tempCube.position.y = 0.9;
  player.add(tempCube);
  scene.add(player);

  loadPlayerModel("./imp.glb")
    .then((model) => {
      // Remove the temporary cube
      player.remove(tempCube);
      tempCube.geometry.dispose();
      tempCube.material.dispose();

      // Add the loaded model to the player group
      player.add(model);

      console.log("Player model loaded successfully");
    })
    .catch((error) => {
      console.error("Failed to load player model:", error);
      addMessage("Failed to load player model. Using fallback.");
    });

  // player = createAnimalPlayer();
  // player.position.y = 0; // Position the base at ground level
  // player.castShadow = true;
  // scene.add(player);
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
  // const playerGeometry = new THREE.BoxGeometry(0.5, 1.8, 0.5); // Approx human height
  // const playerMaterial = new THREE.MeshStandardMaterial({
  //   color: 0x0000ff,
  // }); // Blue player
  // player = new THREE.Mesh(playerGeometry, playerMaterial);
  // player.position.y = 0.9; // Position player slightly above ground base
  // player.castShadow = true;
  // scene.add(player);
  //
  //

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

    // Spacebar to jump
    if (event.key === " ") {
      startJump();

      // Prevent default to avoid page scrolling
      event.preventDefault();
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
  updateJump(delta);
  handleMovement(delta);
  // Update animations
  if (mixer) {
    mixer.update(delta);
  }
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

function createAnimalPlayer() {
  // Create a group to hold all parts of the animal
  const animalGroup = new THREE.Group();

  // Color palette for fox
  const bodyColor = 0xe67e22; // Orange/fox color
  const bellyColor = 0xf5e8dc; // Light cream
  const faceColor = 0xd35400; // Darker orange for face
  const eyeColor = 0x2c3e50; // Dark blue eyes
  const noseColor = 0x34495e; // Dark nose

  // Materials
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: bodyColor });
  const bellyMaterial = new THREE.MeshStandardMaterial({ color: bellyColor });
  const faceMaterial = new THREE.MeshStandardMaterial({ color: faceColor });
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: eyeColor });
  const noseMaterial = new THREE.MeshStandardMaterial({ color: noseColor });

  // Body - smoother elongated sphere
  const bodyGeometry = new THREE.SphereGeometry(0.5, 32, 24);
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.45; // Positioned above ground
  body.scale.set(1, 0.8, 1.2); // Make it oval-shaped
  body.castShadow = true;
  animalGroup.add(body);

  // Belly patch (flattened sphere)
  const bellyGeometry = new THREE.SphereGeometry(
    0.35,
    32,
    24,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.6,
  );
  const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
  belly.rotation.x = Math.PI / 2;
  belly.position.set(0, 0.4, 0.25);
  belly.scale.set(0.8, 1, 0.5);
  animalGroup.add(belly);

  // Head - sphere
  const headGeometry = new THREE.SphereGeometry(0.35, 16, 12);
  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  head.position.set(0, 0.7, 0.5);
  head.castShadow = true;
  animalGroup.add(head);

  // Snout/face
  const snoutGeometry = new THREE.ConeGeometry(0.2, 0.4, 4);
  const snout = new THREE.Mesh(snoutGeometry, faceMaterial);
  snout.rotation.x = -Math.PI / 2;
  snout.position.set(0, 0.65, 0.85);
  snout.castShadow = true;
  animalGroup.add(snout);

  // Eyes with more detail
  function createEye(xPos) {
    // Main eyeball
    const eyeGeometry = new THREE.SphereGeometry(0.06, 24, 24);
    const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye.position.set(xPos, 0.78, 0.7);
    animalGroup.add(eye);

    // Pupil
    const pupilGeometry = new THREE.SphereGeometry(0.03, 16, 16);
    const pupil = new THREE.Mesh(
      pupilGeometry,
      new THREE.MeshBasicMaterial({ color: 0x000000 }),
    );
    pupil.position.set(xPos + 0.04, 0.78, 0.72);
    animalGroup.add(pupil);

    // Highlight
    const highlightGeometry = new THREE.SphereGeometry(0.015, 16, 16);
    const highlight = new THREE.Mesh(
      highlightGeometry,
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    );
    highlight.position.set(xPos + 0.05, 0.79, 0.725);
    animalGroup.add(highlight);

    // Eyelid (top)
    const eyelidGeometry = new THREE.SphereGeometry(
      0.065,
      24,
      24,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.5,
    );
    const eyelid = new THREE.Mesh(
      eyelidGeometry,
      new THREE.MeshBasicMaterial({ color: faceMaterial.color }),
    );
    eyelid.position.set(xPos, 0.78, 0.7);
    eyelid.rotation.x = Math.PI / 2;
    animalGroup.add(eyelid);
    eye.userData.eyelid = eyelid; // Store reference for animation
  }

  createEye(-0.15); // Left eye
  createEye(0.15); // Right eye

  // Nose tip
  const noseGeometry = new THREE.SphereGeometry(0.08, 10, 10);
  const nose = new THREE.Mesh(noseGeometry, noseMaterial);
  nose.position.set(0, 0.65, 1);
  nose.scale.set(1, 0.8, 0.8);
  animalGroup.add(nose);

  // Whiskers
  const whiskerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let i = 0; i < 6; i++) {
    const whiskerGeometry = new THREE.CylinderGeometry(0.01, 0.005, 0.3, 4);
    const whisker = new THREE.Mesh(whiskerGeometry, whiskerMaterial);

    // Position whiskers on either side of nose
    const side = i < 3 ? -1 : 1;
    const row = i % 3;

    whisker.position.set(0.1 * side, 0.65 - row * 0.05, 0.95);
    whisker.rotation.z = (Math.PI / 6) * side;
    whisker.rotation.y = (Math.PI / 8) * (row - 1);

    animalGroup.add(whisker);
  }

  // Ears - two triangular prisms
  function createEar(xPos, zRot) {
    const earGeometry = new THREE.ConeGeometry(0.12, 0.25, 3);
    const ear = new THREE.Mesh(earGeometry, bodyMaterial);
    ear.position.set(xPos, 1, 0.4);
    ear.rotation.x = -Math.PI / 4;
    ear.rotation.z = zRot;
    ear.castShadow = true;
    animalGroup.add(ear);

    // Inner ear
    const innerEarGeometry = new THREE.ConeGeometry(0.06, 0.15, 3);
    const innerEar = new THREE.Mesh(innerEarGeometry, bellyMaterial);
    innerEar.position.set(xPos, 0.98, 0.41);
    innerEar.rotation.x = -Math.PI / 4;
    innerEar.rotation.z = zRot;
    animalGroup.add(innerEar);
  }

  createEar(-0.22, -Math.PI / 5); // Left ear
  createEar(0.22, Math.PI / 5); // Right ear

  // Legs
  function createLeg(xPos, zPos) {
    const legGeometry = new THREE.CylinderGeometry(0.08, 0.05, 0.4, 8);
    const leg = new THREE.Mesh(legGeometry, bodyMaterial);
    leg.position.set(xPos, 0.2, zPos);
    leg.castShadow = true;
    animalGroup.add(leg);

    // Paw
    const pawGeometry = new THREE.SphereGeometry(0.07, 8, 8);
    const paw = new THREE.Mesh(pawGeometry, faceMaterial);
    paw.position.set(xPos, 0, zPos);
    paw.scale.set(1, 0.5, 1.2);
    paw.castShadow = true;
    animalGroup.add(paw);
  }

  // Create four legs
  createLeg(-0.25, 0.3); // Front left
  createLeg(0.25, 0.3); // Front right
  createLeg(-0.25, -0.35); // Back left
  createLeg(0.25, -0.35); // Back right

  // Tail - curved cone
  const tailGeometry = new THREE.CylinderGeometry(0.05, 0.15, 0.6, 8);
  const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
  tail.position.set(0, 0.5, -0.5);
  tail.rotation.x = Math.PI / 3;
  tail.castShadow = true;
  animalGroup.add(tail);

  // Tail tip with different color
  const tailTipGeometry = new THREE.SphereGeometry(0.12, 10, 10);
  const tailTip = new THREE.Mesh(tailTipGeometry, bellyMaterial);
  tailTip.position.set(0, 0.5, -0.8);
  tailTip.castShadow = true;
  animalGroup.add(tailTip);

  // Animation properties
  animalGroup.userData = {
    legSwingPhase: 0,
    tailSwingPhase: 0,
    headBobPhase: 0,
    blinkPhase: 0,
    isBlinking: false,
  };

  // Whole group is slightly rotated to face forward
  animalGroup.rotation.y = Math.PI; // Face forward

  return animalGroup;
}

// Add this to your animation loop for cute animal animations
function animateAnimal(delta) {
  if (!player || !player.userData) return;

  // Only animate when moving
  const isMoving = keys["w"] || keys["a"] || keys["s"] || keys["d"];

  // Update animation phases
  if (isMoving) {
    player.userData.legSwingPhase += delta * 8;
    player.userData.tailSwingPhase += delta * 4;
    player.userData.headBobPhase += delta * 6;
  } else {
    // Idle animation - slower
    player.userData.tailSwingPhase += delta * 2;
    player.userData.headBobPhase += delta;
  }

  // Leg movement
  if (player.children) {
    // Assuming legs are at specific child indices - adjust based on your model
    const legIndices = [10, 11, 12, 13]; // Update these based on your model
    for (let i = 0; i < legIndices.length; i++) {
      const legIndex = legIndices[i];
      if (player.children[legIndex]) {
        // Legs move in pairs (diagonal legs move together)
        const legPhase = player.userData.legSwingPhase + (i % 2 ? 0 : Math.PI);

        if (isMoving) {
          // When moving, legs swing back and forth
          player.children[legIndex].rotation.x = Math.sin(legPhase) * 0.3;
        } else {
          // Reset leg positions when idle
          player.children[legIndex].rotation.x = 0;
        }
      }
    }

    // Tail wagging - more fluid movement
    const tailIndex = 14; // Update based on your model
    if (player.children[tailIndex]) {
      const tail = player.children[tailIndex];
      const baseAngle = Math.sin(player.userData.tailSwingPhase) * 0.3;
      const tipAngle = Math.sin(player.userData.tailSwingPhase * 1.5) * 0.15;

      // Animate base of tail
      tail.rotation.z = baseAngle;

      // Animate tail tip separately for more fluid motion
      if (tail.children && tail.children[0]) {
        tail.children[0].rotation.z = tipAngle;
      }

      // Add slight up/down movement when running
      if (isMoving) {
        tail.rotation.x = Math.sin(player.userData.tailSwingPhase * 2) * 0.1;
      } else {
        tail.rotation.x = 0;
      }
    }

    // Head bobbing
    const headIndex = 2; // Update based on your model
    if (player.children[headIndex]) {
      if (isMoving) {
        // Subtle head bob when moving
        player.children[headIndex].position.y =
          0.7 + Math.sin(player.userData.headBobPhase) * 0.02;
      } else {
        // Occasional "looking around" when idle
        const lookAround = Math.sin(player.userData.headBobPhase * 0.5) * 0.3;
        player.children[headIndex].rotation.y = lookAround;

        // Idle blinking (more relaxed)
        if (Math.random() < 0.005) {
          // ~every 200 frames
          player.userData.isBlinking = true;
          player.userData.blinkPhase = 0;
        }
      }

      // Handle blinking animation if active
      if (player.userData.isBlinking) {
        player.userData.blinkPhase += delta * 8; // Blink speed

        // Get eyes (indices 3 and 4 for left/right eyes)
        const leftEye = player.children[3];
        const rightEye = player.children[4];

        if (
          leftEye &&
          leftEye.userData.eyelid &&
          rightEye &&
          rightEye.userData.eyelid
        ) {
          // Close eyelids during blink
          if (player.userData.blinkPhase < Math.PI) {
            const blinkProgress = Math.sin(player.userData.blinkPhase);
            leftEye.userData.eyelid.position.y = 0.78 + blinkProgress * 0.05;
            rightEye.userData.eyelid.position.y = 0.78 + blinkProgress * 0.05;
          }
          // Finished blinking
          else {
            player.userData.isBlinking = false;
            leftEye.userData.eyelid.position.y = 0.78;
            rightEye.userData.eyelid.position.y = 0.78;
          }
        }
      }
    }
  }
}

// --- Start ---
// Use window.onload to ensure everything including fonts is ready
window.onload = function () {
  init();
};
