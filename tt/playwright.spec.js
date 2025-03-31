import { test, expect } from '@playwright/test';

test.describe('Game UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForFunction(() => window.game !== undefined);
  });

  test('should display initial resource counts', async ({ page }) => {
    const woodCount = page.locator('#wood-count');
    const stoneCount = page.locator('#stone-count');
    
    await expect(woodCount).toBeVisible();
    await expect(stoneCount).toBeVisible();
    await expect(woodCount).toHaveText('0');
    await expect(stoneCount).toHaveText('0');
  });

  test('should open and close crafting menu', async ({ page }) => {
    // Test opening
    await page.click('#craft-items');
    const craftingTable = page.locator('#crafting-table');
    await expect(craftingTable).toBeVisible();
    
    // Test closing via button
    await page.click('#close-crafting');
    await expect(craftingTable).toBeHidden();
    
    // Test reopening and closing via click outside
    await page.click('#craft-items');
    await expect(craftingTable).toBeVisible();
    await page.click('body');
    await expect(craftingTable).toBeHidden();
  });

  test('should show available recipes', async ({ page }) => {
    await page.click('#craft-items');
    const craftingGrid = page.locator('#crafting-grid');
    
    await expect(craftingGrid).toContainText('Wooden Axe');
    await expect(craftingGrid).toContainText('Wooden Pickaxe');
    await expect(craftingGrid).toContainText('Campfire');
    
    // Verify recipe costs are displayed
    await expect(craftingGrid).toContainText('3 WOOD');
    await expect(craftingGrid).toContainText('5 WOOD, 3 STONE');
  });

  test('should manage tools', async ({ page }) => {
    // Test opening
    await page.click('#manage-tools');
    const toolPanel = page.locator('#tool-panel');
    await expect(toolPanel).toBeVisible();
    
    // Test closing via button
    await page.click('#close-tools');
    await expect(toolPanel).toBeHidden();
    
    // Test reopening and closing via click outside
    await page.click('#manage-tools');
    await expect(toolPanel).toBeVisible();
    await page.click('body');
    await expect(toolPanel).toBeHidden();
  });

  test('should update hotbar slots', async ({ page }) => {
    const hotbarSlots = page.locator('.hotbar-slot');
    await expect(hotbarSlots).toHaveCount(9);
    
    // Verify initial active slot
    await expect(hotbarSlots.first()).toHaveClass(/active/);
  });

  test('should switch hotbar slots with number keys', async ({ page }) => {
    // Focus the game canvas
    await page.click('canvas');
    
    // Press number keys and verify active slot changes
    for (let i = 1; i <= 9; i++) {
      await page.keyboard.press(`Digit${i}`);
      const activeSlot = page.locator('.hotbar-slot.active');
      await expect(activeSlot).toHaveAttribute('data-slot', (i-1).toString());
    }
  });
});

test.describe('Game Functionality', () => {
  test('should collect resources when harvesting', async ({ page }) => {
    // This would require mocking game state or setting up test data
    // Implementation would depend on how harvesting is triggered
  });

  test('should craft items when resources available', async ({ page }) => {
    // This would require mocking game state or setting up test data
    // Implementation would depend on how crafting is triggered
  });
});