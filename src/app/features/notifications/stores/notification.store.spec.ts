import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import {
  NotificationItem,
  PageResponse,
} from '../../../shared/models/api.models';
import { NotificationApiService } from '../services/notification-api.service';
import { NotificationStore } from './notification.store';

describe('NotificationStore', () => {
  const firstPageResponse: PageResponse<NotificationItem> = {
    content: [
      {
        id: 'notification-1',
        type: 'TICKET_CREATED',
        title: 'Ticket created',
        message: 'A new ticket was created.',
        relatedTicketId: 'ticket-1',
        read: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        readAt: null,
      },
    ],
    page: 1,
    size: 25,
    totalElements: 35,
    totalPages: 2,
    sort: ['createdAt,DESC'],
  };
  const refreshedPageResponse: PageResponse<NotificationItem> = {
    ...firstPageResponse,
    content: [
      {
        ...firstPageResponse.content[0],
        read: true,
        readAt: '2026-01-01T01:00:00.000Z',
      },
    ],
  };

  let notificationApiServiceMock: {
    list: ReturnType<typeof vi.fn>;
    markAsRead: ReturnType<typeof vi.fn>;
    markAllAsRead: ReturnType<typeof vi.fn>;
  };
  let notificationStore: NotificationStore;

  beforeEach(() => {
    notificationApiServiceMock = {
      list: vi.fn(() => of(firstPageResponse)),
      markAsRead: vi.fn(() => of(undefined)),
      markAllAsRead: vi.fn(() => of(undefined)),
    };

    TestBed.configureTestingModule({
      providers: [
        NotificationStore,
        {
          provide: NotificationApiService,
          useValue: notificationApiServiceMock,
        },
      ],
    });

    notificationStore = TestBed.inject(NotificationStore);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('loads the current notifications page', () => {
    notificationStore.load(1, 25);

    expect(notificationApiServiceMock.list).toHaveBeenCalledWith(1, 25);
    expect(notificationStore.currentPage()).toBe(1);
    expect(notificationStore.pageSize()).toBe(25);
    expect(notificationStore.totalRecords()).toBe(35);
    expect(notificationStore.page()).toEqual(firstPageResponse);
    expect(notificationStore.loading()).toBe(false);
  });

  it('refreshes the same page after marking a notification as read', () => {
    notificationApiServiceMock.list
      .mockReturnValueOnce(of(firstPageResponse))
      .mockReturnValueOnce(of(refreshedPageResponse));

    notificationStore.load(1, 25);
    notificationStore.markAsRead('notification-1');

    expect(notificationApiServiceMock.markAsRead).toHaveBeenCalledWith('notification-1');
    expect(notificationApiServiceMock.list).toHaveBeenNthCalledWith(2, 1, 25);
    expect(notificationStore.page()).toEqual(refreshedPageResponse);
    expect(notificationStore.updating()).toBe(false);
  });

  it('surfaces mutation errors without losing the current page context', () => {
    notificationStore.load(1, 25);
    notificationApiServiceMock.markAllAsRead.mockReturnValueOnce(
      throwError(() => ({
        error: {
          detail: 'Unable to mark all notifications as read.',
        },
      })),
    );

    notificationStore.markAllAsRead();

    expect(notificationStore.errorMessage()).toBe('Unable to mark all notifications as read.');
    expect(notificationStore.currentPage()).toBe(1);
    expect(notificationStore.pageSize()).toBe(25);
    expect(notificationStore.page()).toEqual(firstPageResponse);
    expect(notificationStore.updating()).toBe(false);
  });
});
