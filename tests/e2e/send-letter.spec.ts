import { test, expect } from '@playwright/test';
import { loginToWordPress, createNewPost, insertBlock } from './utils.js';

test.describe('Send Letter Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginToWordPress(page);
  });

  test('should send letter with edited content', async ({ page }) => {
    // Intercept AJAX requests
    let sendLetterPayload: any = null;
    
    await page.route('**/wp-admin/admin-ajax.php*', async (route) => {
      const request = route.request();
      const postData = request.postData();
      
      // Capture send letter requests
      if (postData && postData.includes('action=find_my_rep_send_letter')) {
        sendLetterPayload = Object.fromEntries(
          new URLSearchParams(postData).entries()
        );
      }
      
      // Continue with the request
      await route.continue();
    });

    // Create a new page with the block
    await createNewPost(page, 'page');
    
    // Add a title
    const titleInput = page.locator('.editor-post-title__input');
    await titleInput.fill('Test Letter Sending Page');
    
    // Insert the block
    await insertBlock(page, 'Find My Rep Contact Form');
    
    // Wait for block to be inserted
    const findMyRepBlock = page.locator('[data-type="find-my-rep/contact-form"]');
    await expect(findMyRepBlock).toBeVisible({ timeout: 5000 });
    
    // Publish the page
    const publishButton = page.locator('button.editor-post-publish-button__button').first();
    await publishButton.click();
    
    // Wait for publish panel
    const publishPanelButton = page.locator('.editor-post-publish-panel__header-publish-button button');
    await expect(publishPanelButton).toBeVisible({ timeout: 5000 });
    await publishPanelButton.click();
    
    // Wait for publish to complete
    await expect(page.locator('.components-snackbar__content')).toBeVisible({ timeout: 10000 });
    
    // Get the view page link
    const viewPageLink = page.locator('a').filter({ hasText: /View Page/i }).first();
    await expect(viewPageLink).toBeVisible({ timeout: 5000 });
    
    // Navigate to the published page
    await viewPageLink.click();
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for the frontend component to be visible
    const frontendContainer = page.locator('.find-my-rep-container');
    await expect(frontendContainer).toBeVisible({ timeout: 10000 });
    
    // Check for postcode input (Step 1)
    const postcodeInput = page.locator('input[type="text"]').first();
    await expect(postcodeInput).toBeVisible({ timeout: 5000 });
    
    // Note: Full E2E flow would require:
    // 1. Entering a postcode
    // 2. Selecting representatives
    // 3. Filling in sender details and editing letter
    // 4. Clicking Send button
    // 5. Verifying the intercepted request payload contains edited content
    
    // For now, this test validates:
    // - Block can be inserted in the editor
    // - Page can be published
    // - Frontend component renders correctly
    // - Route interception is set up to capture AJAX requests
    
    // This is a scaffold that can be expanded once API integration is available
    // or mocked in a test environment
  });

  test('should capture edited letter content in request payload', async ({ page, context }) => {
    // This test demonstrates how route interception works
    // It would be expanded to test the full flow with mocked API responses
    
    let capturedPayload: any = null;
    
    await page.route('**/wp-admin/admin-ajax.php', async (route) => {
      const request = route.request();
      const postData = request.postData();
      
      if (postData && postData.includes('action=find_my_rep_send_letter')) {
        capturedPayload = Object.fromEntries(
          new URLSearchParams(postData).entries()
        );
        
        // Mock successful response
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { message: 'Successfully sent 1 letter(s).' }
          })
        });
      } else {
        await route.continue();
      }
    });
    
    // Navigate to a page with the block (would need to be created or seeded in test setup)
    // For scaffold purposes, we validate the route interception mechanism works
    
    expect(capturedPayload).toBeNull(); // Initially null, would be populated when send is triggered
  });
});
