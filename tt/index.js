// Inventory Renderer
class InventoryRenderer {
  constructor(player) {
    this.player = player;
    this.gridElement = document.getElementById("backpack-grid");
    this.toolsElement = document.getElementById("tools-list");
    this.initGrid();
    this.render();
  }

  initGrid() {
    // Create 10x6 grid of slots
    this.gridElement.innerHTML = "";
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 10; x++) {
        const slot = document.createElement("div");
        slot.className = "slot";
        slot.dataset.x = x;
        slot.dataset.y = y;
        this.gridElement.appendChild(slot);
      }
    }
  }

  render() {
    // Render backpack items
    this.player.inventory.backpack.items.forEach((item) => {
      if (!item.x || !item.y) return;

      const slot = document.querySelector(
        `.slot[data-x="${item.x}"][data-y="${item.y}"]`,
      );
      if (slot) {
        const itemElement = document.createElement("div");
        itemElement.className = "item";
        itemElement.style.width = `${item.width * 40}px`;
        itemElement.style.height = `${item.height * 40}px`;
        itemElement.textContent = item.name.split(" ")[0]; // Show first word

        if (item.stackable) {
          itemElement.classList.add("stackable");
          itemElement.dataset.quantity = item.quantity;
        }

        slot.appendChild(itemElement);
      }
    });

    // Render tools
    this.toolsElement.innerHTML = "";
    this.player.inventory.tools.forEach((tool) => {
      const toolElement = document.createElement("div");
      toolElement.className = "tool";
      toolElement.textContent = tool.name;
      this.toolsElement.appendChild(toolElement);
    });
  }
}

// Initialize when game loads
window.addEventListener("load", () => {
  // Get player instance from global object or create a fallback
  const player = window.player || {
    inventory: { backpack: { items: [] }, tools: [] },
  };
  new InventoryRenderer(player);
});
