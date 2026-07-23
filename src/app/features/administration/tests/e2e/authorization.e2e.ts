// Verifies that role-based navigation and route protection behave correctly in the administration area.
import { expect, test } from '@playwright/test';
import {
  createUser,
  createUserRecord,
  installMockBackend,
} from '../../../../tests/e2e/support/mock-backend';

test.describe('Administration authorization e2e', () => {
  test('hides administration navigation for a customer and redirects forbidden routes', async ({
    page,
  }) => {
    // Build a minimal customer session that should never see administration capabilities.
    const customer = createUser({
      id: 'customer-1',
      firstName: 'Juan',
      lastName: 'Cliente',
      email: 'juan@tickets.local',
      role: 'CUSTOMER',
      permissions: [
        'DASHBOARD_READ_PERSONAL',
        'TICKET_CREATE',
        'TICKET_READ_OWN',
        'COMMENT_CREATE_PUBLIC',
        'NOTIFICATION_READ',
      ],
    });

    // Boot the mocked backend with that session already authenticated.
    await installMockBackend(page, {
      sessionUser: customer,
    });

    // Step 1: open the dashboard so the shell can render the navigation for the current role.
    await page.goto('/dashboard');

    // Step 2: verify the customer shell appears and administration links are not rendered at all.
    await expect(page.getByRole('heading', { name: /Hola, Juan/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Usuarios/i })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /Categor/i })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /SLA/i })).toHaveCount(0);

    // Step 3: try to access an administration route directly by URL to validate the route guard as well.
    await page.goto('/admin/categories');

    // Step 4: confirm the app redirects to the forbidden screen instead of exposing the page.
    await expect(page).toHaveURL(/\/forbidden$/);
    await expect(page.getByRole('heading', { name: /Acceso denegado/i })).toBeVisible();
  });

  test('allows an admin to open the users module', async ({ page }) => {
    // Build a fully privileged admin session that should be able to access the users page.
    const admin = createUser({
      id: 'admin-1',
      firstName: 'Ada',
      lastName: 'Admin',
      email: 'ada@tickets.local',
      role: 'ADMIN',
      permissions: [
        'USER_READ',
        'USER_CREATE',
        'USER_UPDATE',
        'USER_DISABLE',
        'CATEGORY_CREATE',
        'CATEGORY_UPDATE',
        'CATEGORY_DISABLE',
        'SLA_READ',
        'SLA_UPDATE',
        'DASHBOARD_READ_GLOBAL',
        'NOTIFICATION_READ',
      ],
    });

    // Provide the users dataset required by the administration screen.
    await installMockBackend(page, {
      sessionUser: admin,
      users: [
        createUserRecord({
          id: 'admin-1',
          firstName: 'Ada',
          lastName: 'Admin',
          email: 'ada@tickets.local',
          role: 'ADMIN',
        }),
      ],
    });

    // Step 1: navigate directly to the administration users module.
    await page.goto('/admin/users');

    // Step 2: confirm the page heading and the primary create action are available for admins.
    await expect(page.getByRole('heading', { name: /Usuarios/i })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByRole('button', { name: /Nuevo usuario/i })).toBeVisible({
      timeout: 15000,
    });
  });
});
