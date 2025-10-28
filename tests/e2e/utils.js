import { expect } from '@playwright/test';

/**
 * WordPress admin credentials (default wp-env credentials)
 */
export const ADMIN_USER = {
  username: 'admin',
  password: 'password',
};

/**
 * Login to WordPress admin
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
export async function loginToWordPress(page) {
  await page.goto('/wp-login.php');
  
  // Fill in login form
  await page.fill('#user_login', ADMIN_USER.username);
  await page.fill('#user_pass', ADMIN_USER.password);
  
  // Click login button
  await page.click('#wp-submit');
  
  // Wait for dashboard to load
  await page.waitForURL('**/wp-admin/**');
  
  // Verify we're logged in by checking for admin bar
  await expect(page.locator('#wpadminbar')).toBeVisible();
}

/**
 * Create a new post or page
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} type - 'post' or 'page'
 * @returns {Promise<void>}
 */
export async function createNewPost(page, type = 'post') {
  await page.goto(`/wp-admin/${type}-new.php`);
  
  // Wait for editor to load
  await page.waitForSelector('.edit-post-layout', { timeout: 30000 });
  
  // Close welcome guide if it appears
  const welcomeGuide = page.locator('button[aria-label="Close"]').filter({ hasText: 'Close' });
  if (await welcomeGuide.isVisible()) {
    await welcomeGuide.click();
  }
}

/**
 * Insert a block in the WordPress block editor
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} blockName - Name of the block to insert (e.g., 'Find My Rep Contact Form')
 */
export async function insertBlock(page, blockName) {
  // Click the block inserter button
  const inserterButton = page.locator('button[aria-label="Add block"]').first();
  await inserterButton.click();
  
  // Search for the block
  const searchInput = page.locator('input[placeholder="Search"]');
  await searchInput.fill(blockName);
  
  // Wait a moment for search results
  await page.waitForTimeout(500);
  
  // Click on the block option
  const blockOption = page.locator(`button[role="option"]`).filter({ hasText: blockName });
  await blockOption.click();
}

/**
 * Publish the current post/page
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
export async function publishPost(page) {
  // Click the publish button
  const publishButton = page.locator('button.editor-post-publish-button__button').first();
  await publishButton.click();
  
  // Wait for publish panel and click final publish button
  const finalPublishButton = page.locator('.editor-post-publish-panel__header-publish-button button');
  await finalPublishButton.click();
  
  // Wait for success message
  await expect(page.locator('.components-snackbar__content')).toContainText('published', { timeout: 10000 });
}
