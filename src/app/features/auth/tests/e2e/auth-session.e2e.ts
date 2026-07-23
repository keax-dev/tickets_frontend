// Exercises the authenticated shell flow from the real login screen through logout.
import { expect, test } from '@playwright/test';
import { createUser, installMockBackend } from '../../../../tests/e2e/support/mock-backend';

test.describe('Auth e2e', () => {
  test('signs in from the login page and allows sign out from the shell', async ({ page }) => {
    // Create the user that the mocked backend will return after a successful login request.
    const supportAgent = createUser({
      id: 'agent-1',
      firstName: 'Grace',
      lastName: 'Agent',
      email: 'grace@tickets.local',
      role: 'SUPPORT_AGENT',
      permissions: [
        'DASHBOARD_READ_PERSONAL',
        'TICKET_READ_ASSIGNED',
        'COMMENT_CREATE_PUBLIC',
        'COMMENT_READ_INTERNAL',
        'NOTIFICATION_READ',
      ],
    });

    // Install the in-memory backend so the browser can execute the full login flow without a real API.
    await installMockBackend(page, {
      sessionUser: null,
      loginUser: supportAgent,
    });

    // Step 1: open the login page exactly as a real user would.
    await page.goto('/login');

    // Step 2: fill the credentials fields with values expected by this scenario.
    await page.getByTestId('login-email-input').fill('grace@tickets.local');
    await page.locator('#login-password-input').fill('SecurePass!234');

    // Step 3: submit the form and wait for the router navigation triggered after authentication.
    await Promise.all([
      page.waitForURL('**/dashboard'),
      page.getByTestId('login-submit-button').click(),
    ]);

    // Step 4: verify that the authenticated shell rendered the user greeting and the dashboard content.
    await expect(page.getByRole('heading', { name: /Hola, Grace/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Panel/i })).toBeVisible();

    // Step 5: sign out from the shell and wait until the app returns to the public login route.
    await Promise.all([page.waitForURL('**/login'), page.getByTestId('logout-button').click()]);

    // Step 6: confirm the session is gone by checking that the login submit action is visible again.
    await expect(page.getByTestId('login-submit-button')).toBeVisible();
  });
});
