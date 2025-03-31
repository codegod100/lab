// Global reference to the game instance (set by game.js)
let gameInstance = null;

// --- Resource Display ---

function updateResourceDisplayInternal() {
    console.log('updateResourceDisplayInternal called.'); // Log function entry
    if (!gameInstance || !gameInstance.player) {
        console.log('updateResourceDisplayInternal: No game instance or player found.');
        return;
    }

    const player = gameInstance.player;
    const resourcesList = document.getElementById('resources-list');
    if (!resourcesList) return;

    // Aggregate resources from backpack items
    const resourceCounts = {};
    player.inventory.backpack.items.forEach(item => {
        if (item.stackable) {
            resourceCounts[item.type] = (resourceCounts[item.type] || 0) + item.quantity;
        }
    });
    console.log('Calculated resourceCounts:', JSON.stringify(resourceCounts)); // Log calculated counts

    // Update the display
    resourcesList.innerHTML = ''; // Clear previous list
    const resourcesToShow = ['WOOD', 'STONE'];
    resourcesToShow.forEach(resType => {
        const count = resourceCounts[resType] || 0;
        const div = document.createElement('div');
        div.textContent = `${resType}: ${count}`;
        resourcesList.appendChild(div);
    });
     if (resourcesList.children.length === 0) {
        resourcesList.textContent = 'None';
     }
}
// NO LONGER EXPOSING GLOBALLY: window.updateResourceDisplay = updateResourceDisplayInternal;

// --- Crafting UI ---

function updateCraftingUIInternal() {
    console.log('updateCraftingUIInternal called.'); // Log function entry
    if (!gameInstance || !gameInstance.player) {
        console.error("Game instance or player not available for crafting UI.");
        return;
    }

    const player = gameInstance.player;
    const craftingGrid = document.getElementById('crafting-grid');
    const craftingResult = document.getElementById('crafting-result');
    if (!craftingGrid || !craftingResult) return;

    craftingGrid.innerHTML = '';
    craftingResult.innerHTML = '';

    const resourceCounts = {};
     player.inventory.backpack.items.forEach(item => {
        if (item.stackable) {
            resourceCounts[item.type] = (resourceCounts[item.type] || 0) + item.quantity;
        }
    });

    const availableRecipes = [
        { id: 'WOODEN_AXE', name: 'Wooden Axe', cost: { WOOD: 3 } },
        { id: 'WOODEN_PICKAXE', name: 'Wooden Pickaxe', cost: { WOOD: 3 } },
        { id: 'CAMPFIRE', name: 'Campfire', cost: { WOOD: 5, STONE: 3 } }
    ];

    availableRecipes.forEach(recipe => {
        const canCraft = player.canCraft(recipe.id);
        const recipeElement = document.createElement('div');
        recipeElement.style.border = '1px solid #555';
        recipeElement.style.padding = '10px';
        recipeElement.style.marginBottom = '10px';
        recipeElement.style.display = 'flex';
        recipeElement.style.justifyContent = 'space-between';
        recipeElement.style.alignItems = 'center';

        const infoDiv = document.createElement('div');
        let costString = Object.entries(recipe.cost)
                             .map(([item, amount]) => {
                                 const current = resourceCounts[item] || 0;
                                 const color = current >= amount ? 'lightgreen' : 'salmon';
                                 return `<span style="color:${color};">${amount} ${item}</span>`;
                             })
                             .join(', ');
        infoDiv.innerHTML = `<b>${recipe.name}</b> <small>(${costString})</small>`;

        const craftBtn = document.createElement('button');
        craftBtn.textContent = 'Craft';
        craftBtn.disabled = !canCraft;
        craftBtn.style.marginLeft = '10px';

        if (canCraft) {
            craftBtn.addEventListener('click', () => {
                if (player.craft(recipe.id)) {
                    craftingResult.textContent = `Crafted ${recipe.name}!`;
                    // The player.craft() method calls uiUpdater.render(),
                    // which now directly calls our internal UI update functions.
                } else {
                    craftingResult.textContent = `Failed to craft ${recipe.name}. (Check space?)`;
                }
            });
        }

        recipeElement.appendChild(infoDiv);
        recipeElement.appendChild(craftBtn);
        craftingGrid.appendChild(recipeElement);
    });

    if (craftingGrid.children.length === 0) {
         craftingGrid.textContent = 'No recipes available.';
    }
}
// NO LONGER EXPOSING GLOBALLY: window.updateCraftingUI = updateCraftingUIInternal;


// --- Event Listeners & Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    const craftButton = document.getElementById('craft-items');
    const closeButton = document.getElementById('close-crafting');
    const craftingTable = document.getElementById('crafting-table');

    // Wait for game.js to initialize and expose game instance
    const checkGameInstance = setInterval(() => {
        console.log("Checking for window.game..."); // Log check attempt
        if (window.game) {
             gameInstance = window.game;
             console.log(">>> Game instance found! <<<", gameInstance); // Log finding it
             clearInterval(checkGameInstance); // Stop checking

             // --- Connect game logic to UI updates ---
             console.log("Checking for gameInstance.uiUpdater..."); // Log check for uiUpdater
             if (gameInstance.uiUpdater) {
                 console.log("gameInstance.uiUpdater found. Assigning UI update functions...");
                 gameInstance.uiUpdater.render = () => {
                     console.log(">>> gameInstance.uiUpdater.render called (assigned by index.js) <<<"); // Make log prominent
                     updateResourceDisplayInternal();
                     // Optional: Update crafting UI only if it's visible
                     if (craftingTable && craftingTable.style.display === 'block') {
                         updateCraftingUIInternal();
                     }
                 };
             } else {
                 console.error("gameInstance.uiUpdater not found!");
             }
             // --- End Connection ---

             updateResourceDisplayInternal(); // Initial resource display

        } else {
            console.log("Waiting for game instance...");
        }
    }, 100); // Check more frequently

    // Toggle Crafting Table
    if (craftButton && craftingTable) {
        craftButton.addEventListener('click', (event) => {
            event.stopPropagation();
            const isHidden = craftingTable.style.display === 'none';
            if (isHidden) {
                updateCraftingUIInternal(); // Update recipes when opening
                craftingTable.style.display = 'block';
            } else {
                craftingTable.style.display = 'none';
            }
        });
    }

    // Close Button
    if (closeButton && craftingTable) {
        closeButton.addEventListener('click', () => {
            craftingTable.style.display = 'none';
        });
    }

    // Click outside to close
    document.addEventListener('click', (event) => {
        if (craftingTable && craftButton && craftingTable.style.display === 'block') {
            if (!craftingTable.contains(event.target) && event.target !== craftButton) {
                craftingTable.style.display = 'none';
            }
        }
    });
});
