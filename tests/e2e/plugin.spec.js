import { test, expect } from '@playwright/test';
import { loginToWordPress, createNewPost, insertBlock, publishPost } from './utils.js';

test.describe('Find My Rep Plugin', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginToWordPress(page);
  });

  test('should be activated in WordPress', async ({ page }) => {
    // Go to plugins page
    await page.goto('/wp-admin/plugins.php');
    
    // Check if plugin is in the list and active
    const pluginRow = page.locator('tr[data-slug="find-my-rep-plugin"]');
    await expect(pluginRow).toBeVisible();
    
    // Verify plugin is active
    const deactivateLink = pluginRow.locator('a.deactivate');
    await expect(deactivateLink).toBeVisible();
  });

  test('should have settings page', async ({ page }) => {
    // Go to settings page
    await page.goto('/wp-admin/options-general.php?page=find-my-rep');
    
    // Verify settings page loads
    await expect(page.locator('h1')).toContainText('Find My Rep Settings');
    
    // Check for expected form fields
    await expect(page.locator('input[name="find_my_rep_api_url"]')).toBeVisible();
    await expect(page.locator('input[name="find_my_rep_resend_key"]')).toBeVisible();
    await expect(page.locator('textarea[name="find_my_rep_template"]')).toBeVisible();
  });

  test('should allow inserting the block in the editor', async ({ page }) => {
    // Create a new page
    await createNewPost(page, 'page');
    
    // Insert the Find My Rep block
    await insertBlock(page, 'Find My Rep Contact Form');
    
    // Verify the block is inserted by checking for a block with our namespace
    const blockEditor = page.locator('.block-editor-block-list__layout');
    await expect(blockEditor).toBeVisible();
    
    // Look for the block - it should have our custom class or data attribute
    const findMyRepBlock = page.locator('[data-type="find-my-rep/contact-form"]');
    await expect(findMyRepBlock).toBeVisible({ timeout: 5000 });
  });

  test('should display block on frontend', async ({ page, context }) => {
    // Create a new page with the block
    await createNewPost(page, 'page');
    
    // Add a title
    const titleInput = page.locator('.editor-post-title__input');
    await titleInput.fill('Test Find My Rep Page');
    
    // Insert the block
    await insertBlock(page, 'Find My Rep Contact Form');
    
    // Wait for block to be inserted
    const findMyRepBlock = page.locator('[data-type="find-my-rep/contact-form"]');
    await expect(findMyRepBlock).toBeVisible({ timeout: 5000 });
    
    // Publish the page
    await publishPost(page);
    
    // Get the view post link
    const viewPostLink = page.locator('a').filter({ hasText: 'View Page' }).first();
    await expect(viewPostLink).toBeVisible();
    
    // Open in a new page (logged out context)
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      viewPostLink.click()
    ]);
    
    // Wait for the page to load
    await newPage.waitForLoadState('domcontentloaded');
    
    // Verify the block is visible on the frontend
    // The block should have some identifying element (e.g., a postcode input)
    await expect(newPage.locator('.find-my-rep-contact-form, #find-my-rep-contact-form, input[placeholder*="postcode" i]')).toBeVisible({ timeout: 10000 });
  });

  test('should show postcode input field', async ({ page }) => {
    // Create a new page with the block
    await createNewPost(page, 'page');
    
    // Insert the block
    await insertBlock(page, 'Find My Rep Contact Form');
    
    // Wait for block to be inserted
    const findMyRepBlock = page.locator('[data-type="find-my-rep/contact-form"]');
    await expect(findMyRepBlock).toBeVisible({ timeout: 5000 });
    
    // Check for postcode input in the editor preview
    // Note: This may need adjustment based on actual block implementation
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
  });
});
