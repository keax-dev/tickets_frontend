import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { TicketApiService } from '../services/ticket-api.service';
import { TicketListStore } from './ticket-list.store';
import { PageResponse, TicketSummary } from '../../../shared/models/api.models';

describe('TicketListStore', () => {
  let firstResponse$: Subject<PageResponse<TicketSummary>>;
  let secondResponse$: Subject<PageResponse<TicketSummary>>;
  let ticketApiServiceMock: {
    listTickets: ReturnType<typeof vi.fn>;
  };
  let ticketListStore: TicketListStore;

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
    ticketListStore.updateSearch('printer');
    ticketListStore.updateSearch('network');

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

    firstResponse$.next({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      sort: ['createdAt,DESC'],
    });
    firstResponse$.complete();

    expect(ticketListStore.search()).toBe('network');
    expect(ticketListStore.page()?.content[0]?.id).toBe('ticket-2');
    expect(ticketListStore.loading()).toBe(false);
    expect(ticketApiServiceMock.listTickets).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ search: 'network' }),
    );
  });
});
