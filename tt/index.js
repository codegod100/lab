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
    
    const resourcesList = document.getElementById('resources-list');
    
    // Aggregate resources
    const resourceCounts = {};
    gameInstance.player.inventory.backpack.items.forEach(item => {
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
                console.log('Pre-craft tools:', gameInstance.player.inventory.tools.map(t => t.name));
                console.log('Before craft - tools:', gameInstance.player.inventory.tools);
                const craftResult = gameInstance.player.craft(recipe.id);
                console.log('After craft - tools:', gameInstance.player.inventory.tools);
                console.log('Craft result:', craftResult);
                if (craftResult) {
                    console.log('Full inventory state:', {
                        tools: JSON.parse(JSON.stringify(gameInstance.player.inventory.tools)),
                        backpack: JSON.parse(JSON.stringify(gameInstance.player.inventory.backpack.items))
                    });
                    craftingResult.textContent = `Crafted ${recipe.name}!`;
                    // Debug tool addition
                    const newTool = gameInstance.player.inventory.tools.find(t => t.name === recipe.name);
                    console.log('New tool details:', newTool);
                    // Update all UIs
                    updateToolManagementUI();
                    updateToolHotbar();
                    updateResourceDisplayInternal();
                    // Verify updates
                    console.log('UI update complete');
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
    if (!gameInstance?.player) {
        console.error('No game instance or player');
        return;
    }
    console.log(gameInstance.player)
    console.log('Full tool inventory:', JSON.parse(JSON.stringify(gameInstance.player.inventory.tools)));
    if (gameInstance.player.inventory.tools.length === 0) {
        console.warn('No tools found in inventory!');
    }
    
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
                console.log('Force refreshing tool panel');
                // Completely rebuild the tool grid
                const toolGrid = document.getElementById('tool-grid');
                toolGrid.innerHTML = '';
                
                const tools = gameInstance.player.inventory.tools;
                console.log('Tools to render:', tools);
                if (tools.length === 0) {
                    console.warn('No tools found in inventory!');
                }
                tools.forEach(tool => {
                    console.log('Rendering tool:', tool);
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
                    if (!toolItem) {
                        console.error('Failed to create tool item!');
                    } else {
                        toolGrid.appendChild(toolItem);
                        console.log('Successfully rendered tool:', tool.name);
                    }
                });
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
