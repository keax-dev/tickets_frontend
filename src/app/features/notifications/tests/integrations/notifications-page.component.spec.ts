// Exercises the notifications page by asserting the initial load and read actions from the rendered list.
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { PageResponse, NotificationItem } from '../../../../shared/models/api.models';
import { NotificationsPageComponent } from '../../pages/notifications-page/notifications-page.component';
import { NotificationStore } from '../../stores/notification.store';

describe('NotificationsPageComponent', () => {
  // Single-page notification fixture used to render the list and paginator state.
  const page: PageResponse<NotificationItem> = {
    content: [
      {
        id: 'notification-1',
        type: 'TICKET_ASSIGNED',
        title: 'Nuevo ticket asignado',
        message: 'Revisa el ticket MT-1.',
        relatedTicketId: 'ticket-1',
        read: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        readAt: null,
      },
    ],
    page: 0,
    size: 10,
    totalElements: 1,
    totalPages: 1,
    sort: ['createdAt,DESC'],
  };

  // Creates the page with a mocked notifications store and stable signal state.
  async function setup() {
    // Step 1: expose a fake notification store with enough signal state for the component to render normally.
    const storeMock = {
      totalRecords: signal(1),
      errorMessage: signal<string | null>(null),
      currentPage: signal(0),
      updating: signal(false),
      pageSize: signal(10),
      loading: signal(false),
      page: signal<PageResponse<NotificationItem> | null>(page),
      load: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
    };

    // Step 2: compile the real page component and override its provider so it consumes the mocked store.
    await TestBed.configureTestingModule({
      imports: [NotificationsPageComponent],
    })
      .overrideComponent(NotificationsPageComponent, {
        set: {
          providers: [
            {
              provide: NotificationStore,
              useValue: storeMock,
            },
          ],
        },
      })
      .compileComponents();

    // Step 3: create and render the page. This initial render is what should trigger the first load call.
    const fixture = TestBed.createComponent(NotificationsPageComponent);
    fixture.detectChanges();
    // Step 4: wait a microtask so any startup side effects complete before assertions run.
    await Promise.resolve();

    // Step 5: expose both the DOM fixture and the store spy to the test body.
    return { fixture, storeMock };
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('loads the first notifications page on init', async () => {
    // Step 1: create the page and let its initialization logic run.
    const { storeMock } = await setup();

    // Step 2: verify that the component requests the default first page with the default page size.
    expect(storeMock.load).toHaveBeenCalledWith(0, 10);
  }, 15000);

  it('marks a notification as read from the rendered list', async () => {
    // Step 1: render the page with one unread notification in the mocked content.
    const { fixture, storeMock } = await setup();
    // Step 2: collect all buttons because the mark-as-read control is rendered through PrimeNG markup.
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    // Step 3: locate the specific action button by its visible text, mirroring how a user identifies it in the UI.
    const markAsReadButton = buttons.find((button) => button.textContent?.includes('Marcar como'));

    // Step 4: simulate the click that should delegate the action to the store.
    markAsReadButton?.click();

    // Step 5: confirm the store received the id of the notification that was rendered on screen.
    expect(storeMock.markAsRead).toHaveBeenCalledWith('notification-1');
  }, 15000);
});
