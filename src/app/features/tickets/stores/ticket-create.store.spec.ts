import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import {
  Category,
  CreateTicketRequest,
  TicketDetail,
} from '../../../shared/models/api.models';
import { TicketApiService } from '../services/ticket-api.service';
import { TicketCreateStore } from './ticket-create.store';

describe('TicketCreateStore', () => {
  const routerMock = {
    navigate: vi.fn(() => Promise.resolve(true)),
  };
  const categories: Category[] = [
    {
      id: 'category-1',
      name: 'Hardware',
      description: 'Physical devices',
      active: true,
      version: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'category-2',
      name: 'Legacy',
      description: 'Inactive category',
      active: false,
      version: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];
  const createdTicket: TicketDetail = {
    id: 'ticket-1',
    code: 'MT-1',
    title: 'Printer failure',
    description: 'The printer stopped working.',
    status: 'CREATED',
    priority: 'HIGH',
    requesterId: 'user-1',
    requesterName: 'Ada',
    assignedAgentId: null,
    assignedAgentName: null,
    categoryId: 'category-1',
    categoryName: 'Hardware',
    firstResponseDueAt: '2026-01-01T00:00:00.000Z',
    firstRespondedAt: null,
    resolutionDueAt: '2026-01-02T00:00:00.000Z',
    resolvedAt: null,
    closedAt: null,
    cancelledAt: null,
    slaPausedAt: null,
    accumulatedPausedSeconds: 0,
    slaFirstResponseBreached: false,
    slaResolutionBreached: false,
    resolutionSummary: null,
    availableActions: ['assign'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    version: 1,
  };

  let ticketApiServiceMock: {
    getCategories: ReturnType<typeof vi.fn>;
    createTicket: ReturnType<typeof vi.fn>;
  };
  let ticketCreateStore: TicketCreateStore;

  beforeEach(() => {
    vi.clearAllMocks();

    ticketApiServiceMock = {
      getCategories: vi.fn(() => of(categories)),
      createTicket: vi.fn(() => of(createdTicket)),
    };

    TestBed.configureTestingModule({
      providers: [
        TicketCreateStore,
        {
          provide: Router,
          useValue: routerMock,
        },
        {
          provide: TicketApiService,
          useValue: ticketApiServiceMock,
        },
      ],
    });

    ticketCreateStore = TestBed.inject(TicketCreateStore);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('loads only active categories', () => {
    ticketCreateStore.loadCategories();

    expect(ticketApiServiceMock.getCategories).toHaveBeenCalledTimes(1);
    expect(ticketCreateStore.categories()).toEqual([categories[0]]);
    expect(ticketCreateStore.loadingCategories()).toBe(false);
    expect(ticketCreateStore.categoryErrorMessage()).toBeNull();
  });

  it('navigates to the ticket detail after creating a ticket', async () => {
    const payload: CreateTicketRequest = {
      title: 'Printer failure',
      description: 'The printer stopped working.',
      categoryId: 'category-1',
      priority: 'HIGH',
    };

    ticketCreateStore.create(payload);

    expect(ticketApiServiceMock.createTicket).toHaveBeenCalledWith(payload);
    expect(ticketCreateStore.submitting()).toBe(false);

    await Promise.resolve();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/tickets', 'ticket-1']);
  });

  it('surfaces category loading errors and clears stale data', () => {
    ticketApiServiceMock.getCategories.mockReturnValueOnce(
      throwError(() => ({
        error: {
          detail: 'Unable to load the available categories.',
        },
      })),
    );

    ticketCreateStore.loadCategories();

    expect(ticketCreateStore.categories()).toEqual([]);
    expect(ticketCreateStore.loadingCategories()).toBe(false);
    expect(ticketCreateStore.categoryErrorMessage()).toBe(
      'Unable to load the available categories.',
    );
  });

  it('surfaces ticket creation errors', () => {
    ticketApiServiceMock.createTicket.mockReturnValueOnce(
      throwError(() => ({
        error: {
          detail: 'Unable to create the ticket right now.',
        },
      })),
    );

    ticketCreateStore.create({
      title: 'Printer failure',
      description: 'The printer stopped working.',
      categoryId: 'category-1',
      priority: 'HIGH',
    });

    expect(ticketCreateStore.errorMessage()).toBe('Unable to create the ticket right now.');
    expect(ticketCreateStore.submitting()).toBe(false);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
