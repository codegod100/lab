import { test, expect } from '@playwright/test';

test.describe('Game UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should display initial resource counts', async ({ page }) => {
    const resourceDisplay = page.locator('#resource-display');
    const resourcesList = page.locator('#resources-list');
    
    await expect(resourceDisplay).toBeVisible();
    await expect(resourceDisplay).toContainText('Resources:');
    await expect(resourcesList).toContainText('WOOD: 0');
    await expect(resourcesList).toContainText('STONE: 0');
  });

  test('should open crafting menu', async ({ page }) => {
    await page.click('#craft-items');
    const craftingTable = page.locator('#crafting-table');
    await craftingTable.waitFor({ state: 'visible', timeout: 10000 });
    await expect(craftingTable).toBeVisible();
  });

  test('should show available recipes', async ({ page }) => {
    await page.click('#craft-items');
    await expect(page.locator('#crafting-grid')).toContainText('Wooden Axe');
    await expect(page.locator('#crafting-grid')).toContainText('Wooden Pickaxe');
  });

  test('should manage tools', async ({ page }) => {
    await page.click('#manage-tools');
    const toolPanel = page.locator('#tool-panel');
    await expect(toolPanel).toBeVisible();
  });

  test('should update hotbar', async ({ page }) => {
    const hotbar = page.locator('#tool-hotbar');
    await expect(hotbar).toBeVisible();
    // Additional hotbar interaction tests would go here
  });
});

test.describe('Game Functionality', () => {
  test('should craft items when resources available', async ({ page }) => {
    // This would require mocking game state or setting up test data
    // Implementation would depend on how crafting is triggered
  });
});