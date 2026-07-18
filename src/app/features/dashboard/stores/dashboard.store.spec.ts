import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import {
  DashboardSummary,
  RecentActivity,
} from '../../../shared/models/api.models';
import { DashboardApiService } from '../services/dashboard-api.service';
import { DashboardStore } from './dashboard.store';

describe('DashboardStore', () => {
  const summary: DashboardSummary = {
    activeTickets: 8,
    createdToday: 3,
    unassignedTickets: 2,
    breachedTickets: 1,
    dueSoonTickets: 4,
    assignedToCurrentUser: 5,
    ticketsByStatus: {
      CREATED: 2,
      ASSIGNED: 1,
      IN_PROGRESS: 3,
      WAITING_FOR_CUSTOMER: 1,
      RESOLVED: 1,
      CLOSED: 0,
      CANCELLED: 0,
    },
    ticketsByPriority: {
      LOW: 1,
      MEDIUM: 3,
      HIGH: 3,
      URGENT: 1,
    },
  };
  const recentActivity: RecentActivity[] = [
    {
      id: 'activity-1',
      ticketId: 'ticket-1',
      action: 'ASSIGNED',
      performedByName: 'Ada Admin',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  let dashboardApiServiceMock: {
    getSummary: ReturnType<typeof vi.fn>;
    getRecentActivity: ReturnType<typeof vi.fn>;
  };
  let dashboardStore: DashboardStore;

  beforeEach(() => {
    dashboardApiServiceMock = {
      getSummary: vi.fn(() => of(summary)),
      getRecentActivity: vi.fn(() => of(recentActivity)),
    };

    TestBed.configureTestingModule({
      providers: [
        DashboardStore,
        {
          provide: DashboardApiService,
          useValue: dashboardApiServiceMock,
        },
      ],
    });

    dashboardStore = TestBed.inject(DashboardStore);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('loads the dashboard summary and recent activity together', () => {
    dashboardStore.load();

    expect(dashboardApiServiceMock.getSummary).toHaveBeenCalledTimes(1);
    expect(dashboardApiServiceMock.getRecentActivity).toHaveBeenCalledTimes(1);
    expect(dashboardStore.summary()).toEqual(summary);
    expect(dashboardStore.recentActivity()).toEqual(recentActivity);
    expect(dashboardStore.loading()).toBe(false);
    expect(dashboardStore.errorMessage()).toBeNull();
  });

  it('clears stale data and exposes an actionable error when loading fails', () => {
    dashboardApiServiceMock.getSummary.mockReturnValueOnce(
      throwError(() => ({
        error: {
          detail: 'Unable to load the dashboard summary.',
        },
      })),
    );

    dashboardStore.load();

    expect(dashboardStore.summary()).toBeNull();
    expect(dashboardStore.recentActivity()).toEqual([]);
    expect(dashboardStore.loading()).toBe(false);
    expect(dashboardStore.errorMessage()).toBe('Unable to load the dashboard summary.');
  });
});
