// Covers the main customer flow for creating a ticket and reaching the freshly created detail page.
import { expect, test } from '@playwright/test';
import {
  createCategory,
  createUser,
  installMockBackend,
} from '../../../../tests/e2e/support/mock-backend';

test.describe('Ticket creation e2e', () => {
  test('creates a ticket and redirects to its detail page', async ({ page }) => {
    // Build the requester session used to create the ticket from the UI.
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

    // Expose at least one category because the form requires a valid selection before submission.
    await installMockBackend(page, {
      sessionUser: customer,
      categories: [
        createCategory({
          id: 'category-hardware',
          name: 'Hardware',
        }),
      ],
    });

    // Step 1: open the new-ticket page.
    await page.goto('/tickets/new');

    // Step 2: verify the page loaded and complete the required text fields.
    await expect(page.getByRole('heading', { name: /Nuevo ticket/i })).toBeVisible();
    await page.getByTestId('ticket-title-input').fill('Computadora sin memoria');
    await page
      .getByTestId('ticket-description-input')
      .fill('La computadora se quedÃ³ sin memoria y ya no permite crear archivos.');

    // Step 3: select a category from the PrimeNG dropdown rendered by the form.
    await page.getByTestId('ticket-category-select').click();
    await page.getByText('Hardware', { exact: true }).click();

    // Step 4: select the desired priority that will be sent in the create-ticket payload.
    await page.getByTestId('ticket-priority-select').click();
    await page.getByText('Alta', { exact: true }).click();

    // Step 5: submit the form and wait until the application redirects to the created ticket detail route.
    await Promise.all([
      page.waitForURL(/\/tickets\/ticket-1$/),
      page.getByTestId('ticket-submit-button').click(),
    ]);

    // Step 6: verify that the detail page shows the generated ticket code, title, and comments tab.
    await expect(page.getByRole('heading', { name: /MT-1/i })).toBeVisible();
    await expect(page.getByText('Computadora sin memoria')).toBeVisible();
    await expect(page.getByRole('tab', { name: /Comentarios/i })).toBeVisible();
  });
});
