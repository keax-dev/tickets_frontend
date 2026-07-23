// Verifies the dashboard store coordinates summary and activity loading while clearing stale state on errors.
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { DashboardSummary, RecentActivity } from '../../../../shared/models/api.models';
import { DashboardApiService } from '../../services/dashboard-api.service';
import { DashboardStore } from '../../stores/dashboard.store';

describe('DashboardStore', () => {
  // Dashboard fixtures that emulate the main widgets and recent activity feed.
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

  // Service spy references and store instance resolved from Angular DI.
  let dashboardApiServiceMock: {
    getSummary: ReturnType<typeof vi.fn>;
    getRecentActivity: ReturnType<typeof vi.fn>;
  };
  let dashboardStore: DashboardStore;

  // Recreates the store with clean service spies before each assertion.
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
    // Step 1: trigger the dashboard loading use case that should request every widget the page needs.
    dashboardStore.load();

    // Step 2: the store should request both summary metrics and recent activity, not just one of them.
    expect(dashboardApiServiceMock.getSummary).toHaveBeenCalledTimes(1);
    expect(dashboardApiServiceMock.getRecentActivity).toHaveBeenCalledTimes(1);
    // Step 3: verify the successful responses were stored in the reactive state consumed by the UI.
    expect(dashboardStore.summary()).toEqual(summary);
    expect(dashboardStore.recentActivity()).toEqual(recentActivity);
    // Step 4: after both requests complete, loading must end and no error should remain.
    expect(dashboardStore.loading()).toBe(false);
    expect(dashboardStore.errorMessage()).toBeNull();
  });

  it('clears stale data and exposes an actionable error when loading fails', () => {
    // Step 1: make the summary request fail to simulate a broken dashboard fetch.
    dashboardApiServiceMock.getSummary.mockReturnValueOnce(
      throwError(() => ({
        error: {
          detail: 'Unable to load the dashboard summary.',
        },
      })),
    );

    // Step 2: run the load use case so the store enters the failure branch.
    dashboardStore.load();

    // Step 3: stale dashboard data must be cleared; otherwise the UI would show old information as if it were current.
    expect(dashboardStore.summary()).toBeNull();
    expect(dashboardStore.recentActivity()).toEqual([]);
    // Step 4: the load cycle must still finish cleanly and expose a readable message for the screen.
    expect(dashboardStore.loading()).toBe(false);
    expect(dashboardStore.errorMessage()).toBe('Unable to load the dashboard summary.');
  });
});
