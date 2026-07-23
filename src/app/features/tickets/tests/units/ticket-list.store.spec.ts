// Covers the ticket list store pagination, overlapping requests, and sort-state transitions.
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { TicketApiService } from '../../services/ticket-api.service';
import { TicketListStore } from '../../stores/ticket-list.store';
import { PageResponse, TicketSummary } from '../../../../shared/models/api.models';

describe('TicketListStore', () => {
  // Subjects let the tests control response order and reproduce overlapping backend requests.
  let firstResponse$: Subject<PageResponse<TicketSummary>>;
  let secondResponse$: Subject<PageResponse<TicketSummary>>;
  let ticketApiServiceMock: {
    listTickets: ReturnType<typeof vi.fn>;
  };
  let ticketListStore: TicketListStore;

  // Rebuild the store and response streams before each scenario.
  beforeEach(() => {
    firstResponse$ = new Subject<PageResponse<TicketSummary>>();
    secondResponse$ = new Subject<PageResponse<TicketSummary>>();
    ticketApiServiceMock = {
      listTickets: vi.fn().mockReturnValueOnce(firstResponse$).mockReturnValueOnce(secondResponse$),
    };

    TestBed.configureTestingModule({
      providers: [
        TicketListStore,
        {
          provide: TicketApiService,
          useValue: ticketApiServiceMock,
        },
      ],
    });

    ticketListStore = TestBed.inject(TicketListStore);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('keeps the latest result when requests overlap', () => {
    // Step 1: trigger one search and then immediately trigger another one before the first response arrives.
    ticketListStore.updateSearch('printer');
    ticketListStore.updateSearch('network');

    // Step 2: resolve the second request first. This simulates a very common race condition in real UIs.
    secondResponse$.next({
      content: [
        {
          id: 'ticket-2',
          code: 'MT-2',
          title: 'Network issue',
          status: 'CREATED',
          priority: 'HIGH',
          requesterId: 'user-1',
          requesterName: 'Ada',
          assignedAgentId: null,
          assignedAgentName: null,
          categoryId: 'category-1',
          categoryName: 'Network',
          resolutionDueAt: '2026-01-01T00:00:00.000Z',
          slaFirstResponseBreached: false,
          slaResolutionBreached: false,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          version: 1,
        },
      ],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
      sort: ['createdAt,DESC'],
    });
    secondResponse$.complete();

    // Step 3: now resolve the older request after the newer one, which is the problematic out-of-order scenario.
    firstResponse$.next({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      sort: ['createdAt,DESC'],
    });
    firstResponse$.complete();

    // Step 4: the store must keep the newest search term and the newest response, ignoring the stale one.
    expect(ticketListStore.search()).toBe('network');
    expect(ticketListStore.page()?.content[0]?.id).toBe('ticket-2');
    // Step 5: also verify the rest of the derived pagination state stayed aligned with the winning response.
    expect(ticketListStore.loading()).toBe(false);
    expect(ticketListStore.currentPage()).toBe(0);
    expect(ticketListStore.pageSize()).toBe(10);
    expect(ticketListStore.totalRecords()).toBe(1);
    // Step 6: finally confirm that the second backend call really corresponded to the latest search value.
    expect(ticketApiServiceMock.listTickets).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ search: 'network' }),
    );
  });

  it('reloads the first page with the selected sort', () => {
    ticketListStore.load(2, 25);
    ticketListStore.updateSort('title', 'ASC');

    expect(ticketListStore.currentPage()).toBe(0);
    expect(ticketListStore.pageSize()).toBe(25);
    expect(ticketListStore.sortBy()).toBe('title');
    expect(ticketListStore.sortDirection()).toBe('ASC');
    expect(ticketApiServiceMock.listTickets).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        direction: 'ASC',
        page: 0,
        size: 25,
        sortBy: 'title',
      }),
    );
  });
});
