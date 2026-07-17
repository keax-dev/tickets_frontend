import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AuthStore } from '../../../core/auth/stores/auth.store';
import { TicketApiService } from '../services/ticket-api.service';
import { TicketDetailStore } from './ticket-detail.store';
import { TicketDetail, TicketHistory, UserRecord } from '../../../shared/models/api.models';

describe('TicketDetailStore', () => {
  const supportUsers: UserRecord[] = [
    {
      id: 'user-admin',
      firstName: 'Ada',
      lastName: 'Admin',
      email: 'ada@example.com',
      role: 'ADMIN',
      active: true,
      lastLoginAt: null,
      version: 1,
    },
    {
      id: 'user-agent',
      firstName: 'Grace',
      lastName: 'Agent',
      email: 'grace@example.com',
      role: 'SUPPORT_AGENT',
      active: true,
      lastLoginAt: null,
      version: 1,
    },
    {
      id: 'user-inactive-agent',
      firstName: 'Casey',
      lastName: 'Inactive',
      email: 'casey@example.com',
      role: 'SUPPORT_AGENT',
      active: false,
      lastLoginAt: null,
      version: 1,
    },
    {
      id: 'user-manager',
      firstName: 'Linus',
      lastName: 'Manager',
      email: 'linus@example.com',
      role: 'SUPPORT_MANAGER',
      active: true,
      lastLoginAt: null,
      version: 1,
    },
  ];
  const initialTicket: TicketDetail = {
    id: 'ticket-1',
    code: 'MT-1',
    title: 'Printer issue',
    status: 'CREATED',
    priority: 'MEDIUM',
    requesterId: 'user-requester',
    requesterName: 'Customer',
    assignedAgentId: null,
    assignedAgentName: null,
    categoryId: 'category-1',
    categoryName: 'Support',
    resolutionDueAt: '2026-01-01T00:00:00.000Z',
    slaFirstResponseBreached: false,
    slaResolutionBreached: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    version: 1,
    description: 'Printer not working',
    firstResponseDueAt: '2026-01-01T00:00:00.000Z',
    firstRespondedAt: null,
    resolvedAt: null,
    closedAt: null,
    cancelledAt: null,
    slaPausedAt: null,
    accumulatedPausedSeconds: 0,
    resolutionSummary: null,
    availableActions: ['assign', 'start'],
  };
  const updatedTicket: TicketDetail = {
    ...initialTicket,
    assignedAgentId: 'user-agent',
    assignedAgentName: 'Grace Agent',
    version: 2,
  };
  const ticketHistory: TicketHistory[] = [
    {
      id: 'history-1',
      action: 'CREATED',
      performedBy: 'user-requester',
      performedByName: 'Customer',
      previousValue: null,
      newValue: 'CREATED',
      metadataJson: null,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];
  let ticketApiServiceMock: {
    getUsers: ReturnType<typeof vi.fn>;
    getTicket: ReturnType<typeof vi.fn>;
    getComments: ReturnType<typeof vi.fn>;
    getHistory: ReturnType<typeof vi.fn>;
    addComment: ReturnType<typeof vi.fn>;
    assignTicket: ReturnType<typeof vi.fn>;
    startTicket: ReturnType<typeof vi.fn>;
    requestInformation: ReturnType<typeof vi.fn>;
    resolveTicket: ReturnType<typeof vi.fn>;
    closeTicket: ReturnType<typeof vi.fn>;
  };
  let authStoreMock: {
    hasPermission: ReturnType<typeof vi.fn>;
  };
  let ticketDetailStore: TicketDetailStore;

  beforeEach(() => {
    ticketApiServiceMock = {
      getUsers: vi.fn(() => of(supportUsers)),
      getTicket: vi
        .fn()
        .mockReturnValueOnce(of(initialTicket))
        .mockReturnValueOnce(of(updatedTicket)),
      getComments: vi.fn(() => of([])),
      getHistory: vi.fn(() => of(ticketHistory)),
      addComment: vi.fn(),
      assignTicket: vi.fn(() => of(updatedTicket)),
      startTicket: vi.fn(),
      requestInformation: vi.fn(),
      resolveTicket: vi.fn(),
      closeTicket: vi.fn(),
    };
    authStoreMock = {
      hasPermission: vi.fn((permission: string) => permission === 'AUDIT_READ'),
    };

    TestBed.configureTestingModule({
      providers: [
        TicketDetailStore,
        {
          provide: AuthStore,
          useValue: authStoreMock,
        },
        {
          provide: TicketApiService,
          useValue: ticketApiServiceMock,
        },
      ],
    });

    ticketDetailStore = TestBed.inject(TicketDetailStore);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('loads ticket bundle and filters support users', () => {
    ticketDetailStore.initialize('ticket-1');

    expect(ticketDetailStore.ticket()?.id).toBe('ticket-1');
    expect(ticketDetailStore.comments()).toEqual([]);
    expect(ticketDetailStore.history()).toEqual(ticketHistory);
    expect(ticketApiServiceMock.getHistory).toHaveBeenCalledWith('ticket-1');
    expect(ticketApiServiceMock.getUsers).toHaveBeenCalledTimes(1);
    expect(ticketDetailStore.supportUsers().map((user) => user.id)).toEqual([
      'user-agent',
      'user-manager',
    ]);
  });

  it('stores an actionable error when support users cannot be loaded', () => {
    ticketApiServiceMock.getUsers.mockReturnValueOnce(
      throwError(() => ({
        error: {
          detail: 'No fue posible cargar los agentes.',
        },
      })),
    );

    ticketDetailStore.initialize('ticket-1');

    expect(ticketDetailStore.supportUsers()).toEqual([]);
    expect(ticketDetailStore.supportUsersLoading()).toBe(false);
    expect(ticketDetailStore.supportUsersError()).toBe('No fue posible cargar los agentes.');
  });

  it('does not request history when the current user lacks audit permission', () => {
    authStoreMock.hasPermission.mockReturnValue(false);

    ticketDetailStore.initialize('ticket-1');

    expect(ticketApiServiceMock.getHistory).not.toHaveBeenCalled();
    expect(ticketDetailStore.history()).toEqual([]);
  });

  it('does not request support users when the ticket cannot be assigned', () => {
    ticketApiServiceMock.getTicket.mockReset();
    ticketApiServiceMock.getTicket.mockReturnValue(
      of({
        ...initialTicket,
        availableActions: ['start'],
      }),
    );

    ticketDetailStore.initialize('ticket-1');

    expect(ticketApiServiceMock.getUsers).not.toHaveBeenCalled();
    expect(ticketDetailStore.supportUsers()).toEqual([]);
  });

  it('refreshes the ticket after assigning an agent', () => {
    ticketDetailStore.initialize('ticket-1');

    let succeeded = false;

    ticketDetailStore.assignTicket('user-agent').subscribe((result) => {
      succeeded = result;
    });

    expect(succeeded).toBe(true);
    expect(ticketApiServiceMock.assignTicket).toHaveBeenCalledWith('ticket-1', {
      version: 1,
      agentId: 'user-agent',
    });
    expect(ticketDetailStore.ticket()?.assignedAgentId).toBe('user-agent');
  });

  it('returns false when the mutation succeeds but the refresh fails', () => {
    ticketApiServiceMock.getTicket.mockReset();
    ticketApiServiceMock.getTicket.mockReturnValueOnce(of(initialTicket)).mockReturnValueOnce(
      throwError(() => ({
        error: {
          detail: 'No fue posible recargar el ticket.',
        },
      })),
    );

    ticketDetailStore.initialize('ticket-1');

    let succeeded: boolean | undefined;

    ticketDetailStore.assignTicket('user-agent').subscribe((result) => {
      succeeded = result;
    });

    expect(succeeded).toBe(false);
    expect(ticketDetailStore.errorMessage()).toBe('No fue posible recargar el ticket.');
  });
});
