// Validates the main notification interactions that a signed-in support user performs from the UI.
import { expect, test } from '@playwright/test';
import {
  createNotification,
  createUser,
  installMockBackend,
} from '../../../../tests/e2e/support/mock-backend';

test.describe('Notifications e2e', () => {
  test('marks a single notification as read', async ({ page }) => {
    // Build the authenticated agent that will consume the notification center.
    const supportAgent = createUser({
      id: 'agent-1',
      firstName: 'Grace',
      lastName: 'Agent',
      email: 'grace@tickets.local',
      role: 'SUPPORT_AGENT',
      permissions: ['DASHBOARD_READ_PERSONAL', 'TICKET_READ_ASSIGNED', 'NOTIFICATION_READ'],
    });

    // Seed one unread notification so the page can render an actionable item.
    await installMockBackend(page, {
      sessionUser: supportAgent,
      notifications: [
        createNotification({
          id: 'notification-1',
          title: 'Nuevo ticket asignado',
          message: 'Tienes un ticket nuevo en cola.',
        }),
      ],
    });

    // Step 1: open the notifications page.
    await page.goto('/notifications');

    // Step 2: verify the page is visible and click the action that marks one row as read.
    await expect(page.getByRole('heading', { name: /Notificaciones/i })).toBeVisible();
    await page.getByTestId('notification-mark-read-notification-1').click();

    // Step 3: after the request resolves, the button should become disabled because the item is already read.
    await expect(page.getByTestId('notification-mark-read-notification-1')).toBeDisabled();
  });

  test('marks the whole notification page as read', async ({ page }) => {
    // Build another support session to validate the bulk-read action.
    const supportAgent = createUser({
      id: 'agent-2',
      firstName: 'Linus',
      lastName: 'Manager',
      email: 'linus@tickets.local',
      role: 'SUPPORT_MANAGER',
      permissions: ['DASHBOARD_READ_GLOBAL', 'TICKET_READ_ALL', 'NOTIFICATION_READ'],
    });

    // Seed multiple unread rows so the bulk action has more than one element to update.
    await installMockBackend(page, {
      sessionUser: supportAgent,
      notifications: [
        createNotification({
          id: 'notification-1',
          title: 'Nuevo ticket asignado',
        }),
        createNotification({
          id: 'notification-2',
          title: 'Respuesta del cliente',
        }),
      ],
    });

    // Step 1: open the notifications page with the unread items already loaded.
    await page.goto('/notifications');

    // Step 2: trigger the "mark all as read" action exposed by the toolbar.
    await page.getByTestId('notifications-mark-all-button').click();

    // Step 3: verify every row became read by checking that each individual action is now disabled.
    await expect(page.getByTestId('notification-mark-read-notification-1')).toBeDisabled();
    await expect(page.getByTestId('notification-mark-read-notification-2')).toBeDisabled();
  });
});
