// Global reference to the game instance
let gameInstance = null;

// Export UI functions for testing
export {
    updateResourceDisplayInternal,
    updateCraftingUIInternal,
    updateToolHotbar,
    updateToolManagementUI
};

// ===== UI UPDATE FUNCTIONS ===== //

// Resource Display
function updateResourceDisplayInternal() {
    if (typeof document === 'undefined') return;
    
    const resourcesList = document.getElementById('resources-list');
    if (!resourcesList) return;
    
    // Aggregate resources
    const resourceCounts = {};
    gameInstance?.player?.inventory?.backpack?.items?.forEach(item => {
        if (item.stackable) {
            resourceCounts[item.type] = (resourceCounts[item.type] || 0) + item.quantity;
        }
    });
    
    // Update display
    resourcesList.innerHTML = '';
    ['WOOD', 'STONE'].forEach(resType => {
        const count = resourceCounts[resType] || 0;
        const div = document.createElement('div');
        div.textContent = `${resType}: ${count}`;
        resourcesList.appendChild(div);
    });
}

// Crafting UI
function updateCraftingUIInternal() {
    if (typeof document === 'undefined') return;
    if (!gameInstance?.player) return;
    
    const craftingGrid = document.getElementById('crafting-grid');
    const craftingResult = document.getElementById('crafting-result');
    if (!craftingGrid || !craftingResult) return;

    craftingGrid.innerHTML = '';
    craftingResult.innerHTML = '';

    // Get resource counts
    const resourceCounts = {};
    gameInstance.player.inventory.backpack.items.forEach(item => {
        if (item.stackable) {
            resourceCounts[item.type] = (resourceCounts[item.type] || 0) + item.quantity;
        }
    });

    // Show recipes
    [
        { id: 'WOODEN_AXE', name: 'Wooden Axe', cost: { WOOD: 3 } },
        { id: 'WOODEN_PICKAXE', name: 'Wooden Pickaxe', cost: { WOOD: 3 } },
        { id: 'CAMPFIRE', name: 'Campfire', cost: { WOOD: 5, STONE: 3 } }
    ].forEach(recipe => {
        const canCraft = gameInstance.player.canCraft(recipe.id);
        const recipeEl = document.createElement('div');
        recipeEl.style.cssText = `
            border: 1px solid #555;
            padding: 10px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const infoDiv = document.createElement('div');
        infoDiv.innerHTML = `<b>${recipe.name}</b> <small>(${
            Object.entries(recipe.cost)
                .map(([item, amount]) => {
                    const current = resourceCounts[item] || 0;
                    const color = current >= amount ? 'lightgreen' : 'salmon';
                    return `<span style="color:${color}">${amount} ${item}</span>`;
                })
                .join(', ')
        })</small>`;

        const craftBtn = document.createElement('button');
        craftBtn.textContent = 'Craft';
        craftBtn.disabled = !canCraft;
        craftBtn.style.marginLeft = '10px';

        if (canCraft) {
            craftBtn.addEventListener('click', () => {
                const craftResult = gameInstance.player.craft(recipe.id);
                if (craftResult) {
                    craftingResult.textContent = `Crafted ${recipe.name}!`;
                    updateToolManagementUI();
                    updateToolHotbar();
                    updateResourceDisplayInternal();
                } else {
                    craftingResult.textContent = `Failed to craft ${recipe.name}. (Check space?)`;
                }
            });
        }

        recipeEl.appendChild(infoDiv);
        recipeEl.appendChild(craftBtn);
        craftingGrid.appendChild(recipeEl);
    });
}

// Tool Hotbar
let activeToolSlot = 0;

function updateToolHotbar() {
    if (typeof document === 'undefined') return;
    if (!gameInstance?.player) return;
    
    const hotbar = document.getElementById('tool-hotbar');
    if (!hotbar) return;
    
    hotbar.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        const slot = document.createElement('div');
        slot.className = 'hotbar-slot';
        if (i === activeToolSlot) slot.classList.add('active');
        
        if (i < gameInstance.player.inventory.tools.length) {
            const tool = gameInstance.player.inventory.tools[i];
            slot.textContent = tool.name.split(' ')[0];
            slot.title = tool.name;
            if (gameInstance.player.activeTool === tool) {
                slot.classList.add('equipped');
            }
        }
        
        slot.addEventListener('click', () => {
            activeToolSlot = i;
            if (i < gameInstance.player.inventory.tools.length) {
                gameInstance.player.activeTool = gameInstance.player.inventory.tools[i];
            }
            updateToolHotbar();
        });
        
        hotbar.appendChild(slot);
    }
}

// Tool Management
function updateToolManagementUI() {
    if (typeof document === 'undefined') return;
    if (!gameInstance?.player) return;
    
    const toolGrid = document.getElementById('tool-grid');
    if (!toolGrid) return;
    
    toolGrid.innerHTML = '';
    
    gameInstance.player.inventory.tools.forEach(tool => {
        const toolItem = document.createElement('div');
        toolItem.className = 'tool-item';
        if (gameInstance.player.activeTool === tool) {
            toolItem.classList.add('equipped');
        }
        
        toolItem.innerHTML = `
            <div><strong>${tool.name}</strong></div>
            <div style="font-size: 0.8em">${tool.type}</div>
        `;
        
        toolItem.addEventListener('click', () => {
            gameInstance.player.activeTool = tool;
            updateToolManagementUI();
            updateToolHotbar();
        });
        
        toolGrid.appendChild(toolItem);
    });
}

// ===== INITIALIZATION ===== //

// Only run in browser environment
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Get UI elements
        const craftButton = document.getElementById('craft-items');
        const closeCrafting = document.getElementById('close-crafting');
        const craftingTable = document.getElementById('crafting-table');
        const manageToolsBtn = document.getElementById('manage-tools');
        const toolPanel = document.getElementById('tool-panel');
        const closeToolsBtn = document.getElementById('close-tools');

        // Crafting toggle
        if (craftButton && craftingTable) {
            craftButton.addEventListener('click', (e) => {
                e.stopPropagation();
                craftingTable.style.display = 
                    craftingTable.style.display === 'none' ? 'block' : 'none';
                if (craftingTable.style.display === 'block') {
                    updateCraftingUIInternal();
                }
            });
        }

        // Close crafting
        if (closeCrafting && craftingTable) {
            closeCrafting.addEventListener('click', () => {
                craftingTable.style.display = 'none';
            });
        }

        // Tool management toggle
        if (manageToolsBtn && toolPanel) {
            manageToolsBtn.addEventListener('click', () => {
                toolPanel.style.display = 
                    toolPanel.style.display === 'none' ? 'block' : 'none';
                if (toolPanel.style.display === 'block') {
                    updateToolManagementUI();
                }
            });
        }

        // Close tool panel
        if (closeToolsBtn && toolPanel) {
            closeToolsBtn.addEventListener('click', () => {
                toolPanel.style.display = 'none';
            });
        }

        // Click outside to close panels
        document.addEventListener('click', (e) => {
            if (craftingTable.style.display === 'block' && 
                !craftingTable.contains(e.target) && 
                e.target !== craftButton) {
                craftingTable.style.display = 'none';
            }
            if (toolPanel.style.display === 'block' && 
                !toolPanel.contains(e.target) && 
                e.target !== manageToolsBtn) {
                toolPanel.style.display = 'none';
            }
        });

        // Wait for game instance
        const checkGameInstance = setInterval(() => {
            if (window.game) {
                gameInstance = window.game;
                clearInterval(checkGameInstance);
                
                // Setup UI updater
                gameInstance.uiUpdater.render = () => {
                    updateResourceDisplayInternal();
                    updateToolHotbar();
                    if (craftingTable.style.display === 'block') {
                        updateCraftingUIInternal();
                    }
                    if (toolPanel.style.display === 'block') {
                        updateToolManagementUI();
                    }
                };
                
                // Initial updates
                updateResourceDisplayInternal();
                updateToolHotbar();
            }
        }, 100);
    });
}
