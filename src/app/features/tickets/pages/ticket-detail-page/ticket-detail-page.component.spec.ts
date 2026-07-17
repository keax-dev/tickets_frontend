import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { vi } from 'vitest';
import { AuthStore } from '../../../../core/auth/stores/auth.store';
import {
  TicketComment,
  TicketDetail,
  TicketHistory,
  UserRecord,
} from '../../../../shared/models/api.models';
import { TicketDetailStore } from '../../stores/ticket-detail.store';
import { TicketDetailPageComponent } from './ticket-detail-page.component';

describe('TicketDetailPageComponent', () => {
  const supportUsers: UserRecord[] = [
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
  ];
  const ticket: TicketDetail = {
    id: 'ticket-1',
    code: 'MT-1',
    title: 'Printer issue',
    status: 'ASSIGNED',
    priority: 'MEDIUM',
    requesterId: 'user-requester',
    requesterName: 'Customer',
    assignedAgentId: 'user-agent',
    assignedAgentName: 'Grace Agent',
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
  const comments: TicketComment[] = [
    {
      id: 'comment-public',
      ticketId: 'ticket-1',
      authorId: 'user-requester',
      authorName: 'Customer',
      content: 'Public comment',
      visibility: 'PUBLIC',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'comment-internal',
      ticketId: 'ticket-1',
      authorId: 'user-agent',
      authorName: 'Grace Agent',
      content: 'Internal note',
      visibility: 'INTERNAL',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];
  const history: TicketHistory[] = [];

  beforeAll(() => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  async function setup(options?: {
    canCreateInternalComments?: boolean;
    canReadInternalComments?: boolean;
    canReadHistory?: boolean;
    trackStoreSignalsInsideInitialize?: boolean;
  }) {
    const paramMapSubject = new BehaviorSubject(convertToParamMap({ ticketId: 'ticket-1' }));
    const storeMock = {
      supportUsers: signal(supportUsers),
      supportUsersLoading: signal(false),
      supportUsersError: signal<string | null>(null),
      errorMessage: signal<string | null>(null),
      comments: signal(comments),
      history: signal(history),
      ticket: signal<TicketDetail | null>(ticket),
      loading: signal(false),
      initialize: vi.fn(() => {
        if (options?.trackStoreSignalsInsideInitialize) {
          storeMock.supportUsers();
          storeMock.supportUsersLoading();
          storeMock.supportUsersError();
        }
      }),
      addComment: vi.fn(() => of(true)),
      assignTicket: vi.fn(() => of(true)),
      startTicket: vi.fn(() => of(true)),
      requestInformation: vi.fn(() => of(true)),
      resolveTicket: vi.fn(() => of(true)),
      closeTicket: vi.fn(() => of(true)),
      reloadSupportUsers: vi.fn(),
    };
    const authStoreMock = {
      hasPermission: vi.fn((permission: string) => {
        if (permission === 'COMMENT_CREATE_INTERNAL') {
          return options?.canCreateInternalComments ?? true;
        }

        if (permission === 'COMMENT_READ_INTERNAL') {
          return options?.canReadInternalComments ?? true;
        }

        if (permission === 'AUDIT_READ') {
          return options?.canReadHistory ?? true;
        }

        return true;
      }),
    };

    await TestBed.configureTestingModule({
      imports: [TicketDetailPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject.asObservable(),
          },
        },
        {
          provide: AuthStore,
          useValue: authStoreMock,
        },
      ],
    })
      .overrideComponent(TicketDetailPageComponent, {
        set: {
          providers: [
            {
              provide: TicketDetailStore,
              useValue: storeMock,
            },
          ],
        },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(TicketDetailPageComponent);

    fixture.detectChanges();
    await fixture.whenStable();

    return {
      fixture,
      component: fixture.componentInstance,
      paramMapSubject,
      storeMock,
    };
  }

  it('resets draft forms when the route ticket changes', async () => {
    const { component, fixture, paramMapSubject, storeMock } = await setup();

    component.commentForm.setValue({ content: 'Pending note', visibility: 'INTERNAL' });
    component.requestInformationForm.setValue({ content: 'Need logs' });
    component.resolveForm.setValue({ resolutionSummary: 'Workaround ready' });
    component.assignmentForm.setValue({ agentId: 'user-agent' });

    paramMapSubject.next(convertToParamMap({ ticketId: 'ticket-2' }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(storeMock.initialize).toHaveBeenNthCalledWith(1, 'ticket-1');
    expect(storeMock.initialize).toHaveBeenNthCalledWith(2, 'ticket-2');
    expect(component.assignmentForm.getRawValue()).toEqual({ agentId: null });
    expect(component.commentForm.getRawValue()).toEqual({
      content: '',
      visibility: 'PUBLIC',
    });
    expect(component.requestInformationForm.getRawValue()).toEqual({ content: '' });
    expect(component.resolveForm.getRawValue()).toEqual({ resolutionSummary: '' });
  });

  it('hides internal comment affordances without the required permissions', async () => {
    const { component } = await setup({
      canCreateInternalComments: false,
      canReadInternalComments: false,
    });

    expect(component.visibilityOptions().map((option) => option.value)).toEqual(['PUBLIC']);
    expect(component.visibleComments().map((comment) => comment.id)).toEqual(['comment-public']);
  });

  it('hides history access without audit permission', async () => {
    const { component, fixture } = await setup({
      canReadHistory: false,
    });

    expect(component.canReadHistory()).toBe(false);
    expect(fixture.nativeElement.textContent).not.toContain('Historial');
  });

  it('does not reinitialize when store signals touched inside initialize change', async () => {
    const { fixture, storeMock } = await setup({
      trackStoreSignalsInsideInitialize: true,
    });

    expect(storeMock.initialize).toHaveBeenCalledTimes(1);

    storeMock.supportUsersLoading.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    storeMock.supportUsersError.set('No fue posible cargar los agentes.');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(storeMock.initialize).toHaveBeenCalledTimes(1);
  });
});
